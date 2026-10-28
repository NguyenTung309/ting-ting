import "server-only";

import { randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool, type PoolClient } from "pg";

/* eslint-disable @typescript-eslint/no-explicit-any -- records are arbitrary persisted JSON documents. */

type RecordOptions = {
  collection: string;
  where?: Record<string, unknown>;
  sort?: string;
  limit?: number;
  page?: number;
  depth?: number;
  overrideAccess?: boolean;
};

const supabaseCA = readFileSync(path.resolve(process.cwd(), "certs/supabase-prod-ca-2021.crt"), "utf8");

export type AppRecord = Record<string, any> & {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
};

export type AppRecordClient = {
  find(options: RecordOptions): Promise<{
    docs: AppRecord[];
    totalDocs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findByID(options: { collection: string; id: number | string; depth?: number; overrideAccess?: boolean }): Promise<AppRecord>;
  create(options: { collection: string; data: Record<string, unknown>; overrideAccess?: boolean }): Promise<AppRecord>;
  update(options: { collection: string; id: number | string; data: Record<string, unknown>; overrideAccess?: boolean }): Promise<AppRecord>;
  delete(options: { collection: string; id: number | string; overrideAccess?: boolean }): Promise<AppRecord>;
};

const runtime = globalThis as typeof globalThis & {
  __tingTingAppDbPool?: Pool;
  __tingTingAppDbSchema?: Promise<void>;
};

type AppDatabaseRow = {
  record_id: string;
  record_data: unknown;
  created_at: Date | string;
  updated_at: Date | string;
};

let unavailableUntil = 0;

function databaseUrl() {
  return process.env.APP_DATABASE_URL || "";
}

function pool(): Pool | null {
  const connectionString = databaseUrl();
  if (!connectionString) return null;
  runtime.__tingTingAppDbPool ??= new Pool({
    connectionString,
    ssl: { ca: supabaseCA, rejectUnauthorized: true },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return runtime.__tingTingAppDbPool;
}

async function ensureSchema(client: PoolClient) {
  runtime.__tingTingAppDbSchema ??= client.query(
    "CREATE TABLE IF NOT EXISTS app_records (" +
      "collection_key TEXT NOT NULL, " +
      "record_id TEXT NOT NULL, " +
      "record_data JSONB NOT NULL DEFAULT '{}'::jsonb, " +
      "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), " +
      "updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), " +
      "PRIMARY KEY (collection_key, record_id)" +
    "); " +
    "CREATE INDEX IF NOT EXISTS app_records_collection_created_idx " +
      "ON app_records (collection_key, created_at);",
  ).then(() => undefined).catch((error: unknown) => {
    runtime.__tingTingAppDbSchema = undefined;
    throw error;
  });
  await runtime.__tingTingAppDbSchema;
}

async function withDatabase<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const connectionPool = pool();
  if (!connectionPool) throw new Error("Application database is not configured.");
  if (Date.now() < unavailableUntil) throw new Error("Application database is temporarily unavailable.");

  const client = await connectionPool.connect();
  try {
    await ensureSchema(client);
    const result = await callback(client);
    unavailableUntil = 0;
    return result;
  } catch (error) {
    unavailableUntil = Date.now() + 3_000;
    throw error;
  } finally {
    client.release();
  }
}

function toId(value: unknown): number | string {
  return /^\d+$/.test(String(value)) ? Number(value) : String(value);
}

function toRecord(row: { record_id: string; record_data: unknown; created_at: Date | string; updated_at: Date | string }): AppRecord {
  const data = row.record_data && typeof row.record_data === "object" && !Array.isArray(row.record_data)
    ? row.record_data as Record<string, any>
    : {};
  const iso = (value: Date | string) => value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  return {
    ...data,
    id: toId(row.record_id),
    createdAt: typeof data.createdAt === "string" ? data.createdAt : iso(row.created_at),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : iso(row.updated_at),
  };
}

function normalize(value: unknown): unknown {
  if (value && typeof value === "object" && "id" in value) return value.id;
  return value;
}

function compare(value: unknown, condition: unknown): boolean {
  const actual = normalize(value);
  if (!condition || typeof condition !== "object" || Array.isArray(condition)) {
    return String(actual ?? "") === String(normalize(condition) ?? "");
  }

  return Object.entries(condition).every(([operator, expected]) => {
    const target = normalize(expected);
    switch (operator) {
      case "equals":
      case "$eq":
        return String(actual ?? "") === String(target ?? "");
      case "not_equals":
      case "$ne":
        return String(actual ?? "") !== String(target ?? "");
      case "in":
      case "$in":
        return Array.isArray(expected) && expected.some((item) => String(actual) === String(normalize(item)));
      case "not_in":
      case "$notIn":
        return Array.isArray(expected) && !expected.some((item) => String(actual) === String(normalize(item)));
      case "greater_than":
      case "gt":
      case "$gt":
        return actual != null && target != null && (Number(actual) > Number(target) || (Number.isNaN(Number(actual)) && String(actual) > String(target)));
      case "greater_than_equal":
      case "gte":
      case "$gte":
        return actual != null && target != null && (Number(actual) >= Number(target) || (Number.isNaN(Number(actual)) && String(actual) >= String(target)));
      case "less_than":
      case "lt":
      case "$lt":
        return actual != null && target != null && (Number(actual) < Number(target) || (Number.isNaN(Number(actual)) && String(actual) < String(target)));
      case "less_than_equal":
      case "lte":
      case "$lte":
        return actual != null && target != null && (Number(actual) <= Number(target) || (Number.isNaN(Number(actual)) && String(actual) <= String(target)));
      case "exists":
        return expected ? value !== undefined && value !== null : value === undefined || value === null;
      case "contains":
        return Array.isArray(actual)
          ? actual.some((item) => String(normalize(item)) === String(target))
          : String(actual ?? "").includes(String(target ?? ""));
      default:
        return String(actual ?? "") === String(target ?? "");
    }
  });
}

function valueAtPath(document: Record<string, any>, path: string): any {
  return path.split(".").reduce((value, segment) => value?.[segment], document);
}

function matches(document: Record<string, any>, where: any): boolean {
  if (!where || typeof where !== "object") return true;
  return Object.entries(where).every(([field, condition]) => {
    if (field === "and" || field === "$and") {
      return Array.isArray(condition) && condition.every((part) => matches(document, part));
    }
    if (field === "or" || field === "$or") {
      return Array.isArray(condition) && condition.some((part) => matches(document, part));
    }
    if (field === "not" || field === "$not") return !matches(document, condition);
    return compare(valueAtPath(document, field), condition);
  });
}

function sortRecords(records: AppRecord[], sort?: string) {
  if (!sort) return records;
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;
  return records.sort((a, b) => {
    const left = valueAtPath(a, field);
    const right = valueAtPath(b, field);
    const result = left == null ? (right == null ? 0 : -1) : right == null ? 1 :
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true });
    return descending ? -result : result;
  });
}

function generatedId() {
  return String(Date.now() * 100 + randomInt(100));
}

export function isAppDatabaseConfigured() {
  return Boolean(databaseUrl());
}

export function markAppDatabaseUnavailable() {
  unavailableUntil = Date.now() + 3_000;
}

export async function checkAppDatabase(): Promise<boolean> {
  if (!pool()) return false;
  try {
    await withDatabase(async (client) => {
      await client.query("SELECT 1");
    });
    return true;
  } catch {
    return false;
  }
}

export function getAppRecordClient(): AppRecordClient | null {
  if (!pool()) return null;

  return {
    async find(options) {
      const safeLimit = Math.min(Math.max(Number(options.limit) || 10, 1), 500);
      const safePage = Math.max(Number(options.page) || 1, 1);
      return withDatabase(async (client) => {
        const result = await client.query<AppDatabaseRow>(
          "SELECT record_id, record_data, created_at, updated_at FROM app_records WHERE collection_key = $1",
          [options.collection],
        );
        const records = result.rows.map(toRecord).filter((record: AppRecord) => matches(record, options.where));
        sortRecords(records, options.sort);
        const totalDocs = records.length;
        const totalPages = Math.ceil(totalDocs / safeLimit);
        const offset = (safePage - 1) * safeLimit;
        return {
          docs: records.slice(offset, offset + safeLimit),
          totalDocs,
          hasNextPage: safePage < totalPages,
          hasPrevPage: safePage > 1,
          page: safePage,
          limit: safeLimit,
          totalPages,
        };
      });
    },

    async findByID({ collection, id }) {
      return withDatabase(async (client) => {
        const result = await client.query<AppDatabaseRow>(
          "SELECT record_id, record_data, created_at, updated_at FROM app_records WHERE collection_key = $1 AND record_id = $2 LIMIT 1",
          [collection, String(id)],
        );
        if (!result.rows[0]) throw new Error("Application record not found.");
        return toRecord(result.rows[0]);
      });
    },

    async create({ collection, data }) {
      const recordId = collection === "users" ? String(data.accountId ?? data.id ?? generatedId()) : generatedId();
      const recordData = { ...data };
      delete recordData.documentId;
      delete recordData.createdAt;
      delete recordData.updatedAt;
      if (collection === "users") {
        delete recordData.id;
        recordData.accountId = recordId;
      }
      return withDatabase(async (client) => {
        const result = await client.query<AppDatabaseRow>(
          "INSERT INTO app_records (collection_key, record_id, record_data) " +
          "VALUES ($1, $2, $3::jsonb) " +
          "RETURNING record_id, record_data, created_at, updated_at",
          [collection, recordId, JSON.stringify(recordData)],
        );
        return toRecord(result.rows[0]);
      });
    },

    async update({ collection, id, data }) {
      return withDatabase(async (client) => {
        const current = await client.query<AppDatabaseRow>(
          "SELECT record_id, record_data, created_at, updated_at FROM app_records WHERE collection_key = $1 AND record_id = $2 LIMIT 1",
          [collection, String(id)],
        );
        const row = current.rows[0];
        if (!row) throw new Error("Application record not found.");
        const patch = { ...data };
        for (const key of ["id", "documentId", "createdAt", "updatedAt"]) delete patch[key];
        if (collection === "users") {
          delete patch.accountId;
          delete patch.googleSubject;
        }
        const currentData = row.record_data && typeof row.record_data === "object" ? row.record_data : {};
        const updatedData = { ...currentData, ...patch };
        const result = await client.query<AppDatabaseRow>(
          "UPDATE app_records SET record_data = $3::jsonb, updated_at = NOW() " +
          "WHERE collection_key = $1 AND record_id = $2 " +
          "RETURNING record_id, record_data, created_at, updated_at",
          [collection, String(id), JSON.stringify(updatedData)],
        );
        return toRecord(result.rows[0]);
      });
    },

    async delete({ collection, id }) {
      return withDatabase(async (client) => {
        const result = await client.query<AppDatabaseRow>(
          "DELETE FROM app_records WHERE collection_key = $1 AND record_id = $2 " +
          "RETURNING record_id, record_data, created_at, updated_at",
          [collection, String(id)],
        );
        if (!result.rows[0]) throw new Error("Application record not found.");
        return toRecord(result.rows[0]);
      });
    },
  };
}

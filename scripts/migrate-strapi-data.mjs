import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import pg from "pg";

const sourcePath = process.argv.find((arg) => !arg.startsWith("-") && /\.(db|sqlite)$/i.test(arg)) || "cms/.tmp/data.db";
const targetUrl = process.env.APP_DATABASE_URL;
const sourceUrl = process.env.STRAPI_DATABASE_URL;
if (!targetUrl) throw new Error("Set APP_DATABASE_URL to the new application database.");
if (!sourceUrl && !existsSync(sourcePath)) throw new Error("The local Strapi SQLite database was not found at " + sourcePath + ".");

const { Pool } = pg;
const targetPool = new Pool({ connectionString: targetUrl });
const sourcePool = sourceUrl ? new Pool({ connectionString: sourceUrl, max: 1 }) : null;
const sqlite = sourcePool ? null : new DatabaseSync(sourcePath, { readOnly: true });

function parseJson(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string" || !value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function timestamp(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  const numeric = typeof value === "number" || /^\d{12,13}$/.test(String(value));
  const parsed = numeric ? new Date(Number(value)) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function sqliteHasTable(name) {
  return Boolean(sqlite?.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));
}

async function loadSourceRows(sql, sqliteQuery) {
  if (sourcePool) {
    const result = await sourcePool.query(sql);
    return result.rows;
  }
  if (!sqliteHasTable(sqliteQuery.table)) return [];
  return sqlite.prepare(sqliteQuery.query).all();
}

const appRows = await loadSourceRows(
  "SELECT collection_key, record_id, record_data, created_at, updated_at FROM app_records",
  {
    table: "app_records",
    query: "SELECT collection_key, record_id, record_data, created_at, updated_at FROM app_records",
  },
);
const memberRows = await loadSourceRows(
  "SELECT account_id, google_subject, email, display_name, avatar, status, last_seen_at, consent_version, date_of_birth, created_at, updated_at FROM member_profiles",
  {
    table: "member_profiles",
    query: "SELECT account_id, google_subject, email, display_name, avatar, status, last_seen_at, consent_version, date_of_birth, created_at, updated_at FROM member_profiles",
  },
);

const client = await targetPool.connect();
let importedRecords = 0;
let importedMembers = 0;
try {
  await client.query("BEGIN");
  await client.query(
    "CREATE TABLE IF NOT EXISTS app_records (" +
      "collection_key TEXT NOT NULL, " +
      "record_id TEXT NOT NULL, " +
      "record_data JSONB NOT NULL DEFAULT '{}'::jsonb, " +
      "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), " +
      "updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), " +
      "PRIMARY KEY (collection_key, record_id)" +
    ")",
  );
  await client.query(
    "CREATE INDEX IF NOT EXISTS app_records_collection_created_idx " +
      "ON app_records (collection_key, created_at)",
  );

  const upsert = "INSERT INTO app_records (collection_key, record_id, record_data, created_at, updated_at) " +
    "VALUES ($1, $2, $3::jsonb, COALESCE($4::timestamptz, NOW()), COALESCE($5::timestamptz, NOW())) " +
    "ON CONFLICT (collection_key, record_id) DO UPDATE SET " +
    "record_data = EXCLUDED.record_data, updated_at = EXCLUDED.updated_at";

  for (const row of appRows) {
    await client.query(upsert, [
      row.collection_key,
      String(row.record_id),
      JSON.stringify(parseJson(row.record_data)),
      timestamp(row.created_at),
      timestamp(row.updated_at),
    ]);
    importedRecords += 1;
  }

  for (const row of memberRows) {
    const accountId = String(row.account_id);
    const member = {
      accountId,
      googleSubject: row.google_subject,
      email: row.email,
      displayName: row.display_name,
      avatar: row.avatar,
      status: row.status || "active",
      lastSeenAt: row.last_seen_at,
      consentVersion: row.consent_version,
      dateOfBirth: row.date_of_birth,
    };
    await client.query(upsert, [
      "users",
      accountId,
      JSON.stringify(member),
      timestamp(row.created_at),
      timestamp(row.updated_at),
    ]);
    importedMembers += 1;
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  sqlite?.close();
  await sourcePool?.end();
  await targetPool.end();
}

console.log("Migrated " + importedRecords + " application record(s) and " + importedMembers + " account profile(s).");

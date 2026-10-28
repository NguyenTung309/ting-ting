import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const connectionString = process.env.PAYLOAD_DATABASE_URL;
if (!connectionString) throw new Error("Set PAYLOAD_DATABASE_URL before applying the Payload post tags migration.");

const ssl = process.env.PAYLOAD_DATABASE_SSL === "false"
  ? false
  : { ca: readFileSync(path.join(root, "certs/supabase-prod-ca-2021.crt"), "utf8"), rejectUnauthorized: true };
const migration = readFileSync(path.join(root, "migrations/payload/20261012_posts_tags.sql"), "utf8");
const pool = new Pool({ connectionString, ssl, connectionTimeoutMillis: 5_000, max: 1 });
const client = await pool.connect();

try {
  const tables = await client.query("SELECT to_regclass('public.ttt_payload_posts') IS NOT NULL AS posts, to_regclass('public._ttt_payload_posts_v') IS NOT NULL AS versions");
  if (!tables.rows[0]?.posts || !tables.rows[0]?.versions) {
    throw new Error("Payload post tables are not initialized yet. Start the app once, then run this migration.");
  }
  await client.query("BEGIN");
  await client.query(migration);
  await client.query("COMMIT");
  console.log("Payload post tags migration applied.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}

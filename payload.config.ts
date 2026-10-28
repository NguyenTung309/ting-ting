import { readFileSync } from "node:fs";
import path from "node:path";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { Categories } from "./payload/collections/Categories";
import { Media } from "./payload/collections/Media";
import { Posts } from "./payload/collections/Posts";
import { Users } from "./payload/collections/Users";

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const caPath = path.resolve(process.cwd(), "certs/supabase-prod-ca-2021.crt");
const supabaseCA = readFileSync(caPath, "utf8");
const payloadDatabaseSSL = process.env.PAYLOAD_DATABASE_SSL === "false"
  ? false
  : { ca: supabaseCA, rejectUnauthorized: true };

const postgresDatabaseAdapter = postgresAdapter({
  pool: {
    connectionString: process.env.PAYLOAD_DATABASE_URL || "",
    ssl: payloadDatabaseSSL,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    max: 10,
  },
  tablesFilter: [
    "payload_kv",
    "payload_migrations",
    "payload_preferences",
    "payload_preferences_rels",
    "ttt_payload_*",
    "_ttt_payload_*",
  ],
  push: process.env.PAYLOAD_DB_PUSH === "true",
});

const databaseAdapter = {
  ...postgresDatabaseAdapter,
  init(options: Parameters<typeof postgresDatabaseAdapter.init>[0]) {
    const adapter = postgresDatabaseAdapter.init(options);
    const initializing = (adapter as typeof adapter & { initializing?: Promise<unknown> }).initializing;

    // The Postgres adapter rejects this internal signal without a reason when
    // connection startup fails. Mark it handled; connect() still rejects with
    // the real connection error and the caller can provide a content fallback.
    void initializing?.catch(() => undefined);
    return adapter;
  },
};

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || process.env.AUTH_SECRET || "local-only-payload-secret-change-me",
  serverURL: siteURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: process.cwd() },
  },
  collections: [Users, Posts, Categories, Media],
  editor: lexicalEditor(),
  db: databaseAdapter,
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
});

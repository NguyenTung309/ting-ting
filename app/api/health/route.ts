import { NextResponse } from "next/server";

import { checkAppDatabase } from "@/lib/app-database";
import { checkPayloadCms } from "@/lib/content";
import { storageHealthy, storageMode } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const [database, payload, storage] = await Promise.all([
    checkAppDatabase(),
    checkPayloadCms(),
    storageHealthy(),
  ]);
  const appHealthy = database && storage;
  const httpStatus = appHealthy || process.env.NODE_ENV !== "production" ? 200 : 503;
  return NextResponse.json({
    status: appHealthy && payload ? "ok" : "degraded",
    app: true,
    database,
    payload,
    storage: storageMode(),
    storageHealthy: storage,
    timestamp: new Date().toISOString(),
  }, { status: httpStatus });
}

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAppRecordClient } from "@/lib/app-database";
import { findAllTestSubmissions, financeRowsForFilters } from "@/lib/admin/result-analytics";
import { financeAnalyticsCsv, parseResultAnalyticsFilters } from "@/lib/tests/result-analytics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const records = getAppRecordClient();
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });

  try {
    const submissions = await findAllTestSubmissions(records);
    const filters = parseResultAnalyticsFilters(new URL(request.url).searchParams);
    const rows = financeRowsForFilters(submissions, filters);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(financeAnalyticsCsv(rows), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ting-ting-result-analytics-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Không xuất được dữ liệu kết quả." }, { status: 503 });
  }
}

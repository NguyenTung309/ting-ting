import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAppRecordClient } from "@/lib/app-database";
import { findAllTestSubmissions } from "@/lib/admin/result-analytics";
import { isAdminAccountEmail } from "@/lib/user-roles";
import { filterFinanceAnalyticsRows, parseResultAnalyticsFilters, summarizeFinanceAnalytics, toFinanceAnalyticsRow } from "@/lib/tests/result-analytics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const records = getAppRecordClient();
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });

  try {
    const [submissions, userFirstPage] = await Promise.all([
      findAllTestSubmissions(records),
      records.find({ collection: "users", limit: 500, page: 1, overrideAccess: true }),
    ]);
    const users = [...userFirstPage.docs];
    for (let page = 2; page <= userFirstPage.totalPages; page += 1) {
      const next = await records.find({ collection: "users", limit: 500, page, overrideAccess: true });
      users.push(...next.docs);
    }

    const userById = new Map(users.map((user) => [String(user.id), user]));
    const publicUsers = users.filter((user) => user.accountType !== "admin" && !isAdminAccountEmail(String(user.email || "")));
    const now = Date.now();
    let last30Days = 0;
    for (const submission of submissions) {
      const submittedAt = Date.parse(String(submission.completedAt || submission.submittedAt || submission.createdAt || ""));
      if (Number.isFinite(submittedAt) && submittedAt >= now - 30 * 24 * 60 * 60 * 1000) last30Days += 1;
    }

    const userId = (value: unknown) => value && typeof value === "object" && "id" in value ? String((value as { id: unknown }).id) : String(value || "");
    const filters = parseResultAnalyticsFilters(new URL(request.url).searchParams);
    const analyticsRows = submissions.map((submission) => toFinanceAnalyticsRow(submission as unknown as Record<string, unknown>));
    const filteredAnalyticsRows = filterFinanceAnalyticsRows(analyticsRows, filters);
    return NextResponse.json({
      totalSubmissions: submissions.length,
      submissionsLast30Days: last30Days,
      totalUsers: publicUsers.length,
      analytics: summarizeFinanceAnalytics(filteredAnalyticsRows),
      filters,
      recentSubmissions: submissions.slice(0, 8).map((submission) => ({
        id: String(submission.id),
        name: String(submission.respondentName || submission.partnerName || "Ẩn danh"),
        email: String(userById.get(userId(submission.user))?.email || ""),
        test: String(submission.testSlug || ""),
        result: String(submission.resultTitle || submission.resultKey || "Chưa phân loại"),
        code: String(submission.tttCode || ""),
        submittedAt: String(submission.completedAt || submission.submittedAt || submission.createdAt || ""),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Không đọc được dữ liệu dashboard." }, { status: 503 });
  }
}

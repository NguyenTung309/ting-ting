import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAppRecordClient } from "@/lib/app-database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const records = getAppRecordClient();
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });
  const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1);

  try {
    const result = await records.find({ collection: "test-submissions", sort: "-submittedAt", limit: 25, page, overrideAccess: true });
    const userIds = [...new Set(result.docs.map((submission) => {
      const relation = submission.user;
      return relation && typeof relation === "object" && "id" in relation ? String((relation as { id: unknown }).id) : String(relation || "");
    }).filter(Boolean))];
    const users = await Promise.all(userIds.map((id) => records.findByID({ collection: "users", id, overrideAccess: true }).catch(() => null)));
    const userById = new Map(users.filter(Boolean).map((user) => [String(user?.id), user]));
    return NextResponse.json({
      total: result.totalDocs,
      page: result.page,
      totalPages: result.totalPages,
      items: result.docs.map((submission) => ({
        id: String(submission.id),
        name: String(submission.respondentName || submission.partnerName || "Ẩn danh"),
        partnerName: String(submission.partnerName || ""),
        userEmail: String(userById.get(String(submission.user && typeof submission.user === "object" && "id" in submission.user ? (submission.user as { id: unknown }).id : submission.user || ""))?.email || ""),
        test: String(submission.testSlug || ""),
        result: String(submission.resultTitle || submission.resultKey || "Chưa phân loại"),
        code: String(submission.tttCode || ""),
        submittedAt: String(submission.submittedAt || submission.createdAt || ""),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Không tải được danh sách lượt làm bài." }, { status: 503 });
  }
}

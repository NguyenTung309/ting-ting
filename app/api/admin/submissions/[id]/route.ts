import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAppRecordClient } from "@/lib/app-database";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const records = getAppRecordClient();
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });
  const { id } = await params;
  try {
    const submission = await records.findByID({ collection: "test-submissions", id, overrideAccess: true });
    const relation = submission.user;
    const userId = relation && typeof relation === "object" && "id" in relation ? String((relation as { id: unknown }).id) : String(relation || "");
    const user = userId ? await records.findByID({ collection: "users", id: userId, overrideAccess: true }).catch(() => null) : null;
    return NextResponse.json({
      submission: {
        id: String(submission.id),
        name: String(submission.respondentName || "Ẩn danh"),
        partnerName: String(submission.partnerName || ""),
        test: String(submission.testSlug || ""),
        kind: String(submission.testKind || "finance"),
        version: Number(submission.testVersion || 1),
        result: String(submission.resultTitle || submission.resultKey || "Chưa phân loại"),
        resultKey: String(submission.resultKey || ""),
        code: String(submission.tttCode || ""),
        submittedAt: String(submission.submittedAt || submission.createdAt || ""),
        user: user ? { id: String(user.id), name: String(user.displayName || user.name || ""), email: String(user.email || "") } : null,
        answers: submission.answers || {},
        questionSnapshot: Array.isArray(submission.questionSnapshot) ? submission.questionSnapshot : [],
        scoringNotes: Array.isArray(submission.scoringNotes) ? submission.scoringNotes : [],
        rawScores: submission.rawScores || {},
        adjustedScores: submission.adjustedScores || {},
        scores: submission.scores || {},
        score: typeof submission.score === "number" ? submission.score : null,
        formulaVersion: Number(submission.formulaVersion || 1),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy lượt làm bài." }, { status: 404 });
  }
}

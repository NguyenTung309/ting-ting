import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { isValidTTTCode, normalizeTTTCode } from "@/lib/tests/submissions";
import { pendingResultCookieName, readPendingResultToken } from "@/lib/tests/pending-result";

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập để nhận kết quả." }, { status: 401 });
  const { code: rawCode } = await params;
  const code = normalizeTTTCode(rawCode);
  if (!isValidTTTCode(code)) return NextResponse.json({ error: "Mã TTT không hợp lệ." }, { status: 400 });
  if (readPendingResultToken(request.cookies.get(pendingResultCookieName)?.value) !== code) {
    return NextResponse.json({ error: "Phiên xác nhận kết quả đã hết hạn. Hãy làm lại bài test để lưu kết quả vào tài khoản." }, { status: 403 });
  }
  const cms = await getAppRecordClient();
  if (!cms) return NextResponse.json({ error: "Dịch vụ dữ liệu chưa sẵn sàng." }, { status: 503 });
  const found = await cms.find({ collection: "test-submissions", where: { tttCode: { equals: code } }, limit: 1, overrideAccess: true });
  if (!found.docs[0]) return NextResponse.json({ error: "Không tìm thấy mã TTT." }, { status: 404 });
  const submission = found.docs[0];
  const currentOwner = submission.user && typeof submission.user === "object" && "id" in submission.user ? String((submission.user as { id: unknown }).id) : String(submission.user || "");
  if (currentOwner && currentOwner !== userId) return NextResponse.json({ error: "Kết quả này đã được liên kết với một tài khoản khác." }, { status: 409 });
  if (!currentOwner) await cms.update({ collection: "test-submissions", id: submission.id, data: { user: userId }, overrideAccess: true });
  const response = NextResponse.json({ success: true, tttCode: submission.tttCode });
  response.cookies.set(pendingResultCookieName, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}

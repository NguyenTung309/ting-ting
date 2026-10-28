import { NextRequest, NextResponse } from "next/server";

import { getOwnedResultByCode, isValidTTTCode } from "@/lib/tests/submissions";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập Google để xem kết quả." }, { status: 401 });
  const { rateLimit, rateLimitResponse } = await import("@/lib/rate-limit");
  const rate = rateLimit(request, "result-lookup", 60, 60_000);
  if (!rate.ok) return rateLimitResponse(rate.retryAfter);
  const { code } = await params;
  if (!isValidTTTCode(code)) return NextResponse.json({ error: "Mã TTT không hợp lệ." }, { status: 400 });
  const result = await getOwnedResultByCode(code, userId);
  if (!result) return NextResponse.json({ error: "Không tìm thấy mã TTT này." }, { status: 404 });
  return NextResponse.json(result);
}

import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";

import { ResultCard } from "@/components/tests/ResultCard";
import { getOwnedResultByCode, isValidTTTCode } from "@/lib/tests/submissions";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập Google để tải ảnh kết quả." }, { status: 401 });
  const rate = rateLimit(request, "result-card", 30, 60_000);
  if (!rate.ok) return rateLimitResponse(rate.retryAfter);

  const { code } = await params;
  if (!isValidTTTCode(code)) return NextResponse.json({ error: "Mã TTT không hợp lệ." }, { status: 400 });

  const result = await getOwnedResultByCode(code, userId);
  if (!result) return NextResponse.json({ error: "Không tìm thấy mã TTT này." }, { status: 404 });

  return new ImageResponse(
    createElement(ResultCard, {
      title: result.title,
      summary: result.summary,
      score: result.score,
      tttCode: result.tttCode,
      characterId: result.characterId,
      imageChoice: result.imageChoice,
    }),
    { width: 1200, height: 630 },
  );
}

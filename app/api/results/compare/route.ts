import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getPublicResultByCode, isValidTTTCode } from "@/lib/tests/submissions";
import { getPublishedTrendByKey } from "@/lib/trends/data";
import { buildCompatibilityResult } from "@/lib/trends/compatibility";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentUserId } from "@/lib/auth";

const requestSchema = z.object({ codeA: z.string().min(1), codeB: z.string().min(1) });

export async function POST(request: NextRequest) {
  if (!await getCurrentUserId()) return NextResponse.json({ error: "Bạn cần đăng nhập Google để xem kết quả so sánh." }, { status: 401 });
  const rate = rateLimit(request, "result-compare", 30, 60_000);
  if (!rate.ok) return rateLimitResponse(rate.retryAfter);
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Bạn nhập đủ hai mã TTT nhé." }, { status: 400 });
  if (!isValidTTTCode(parsed.data.codeA) || !isValidTTTCode(parsed.data.codeB)) {
    return NextResponse.json({ error: "Mã TTT cần có dạng TTT-A72K9." }, { status: 400 });
  }

  const [personA, personB] = await Promise.all([getPublicResultByCode(parsed.data.codeA), getPublicResultByCode(parsed.data.codeB)]);
  if (!personA || !personB) return NextResponse.json({ error: "Không tìm thấy một trong hai mã TTT." }, { status: 404 });
  if (personA.testSlug !== "finance-trend" || personB.testSlug !== "finance-trend") return NextResponse.json({ error: "Mã này chưa thuộc bài Test xu hướng tài chính." }, { status: 400 });

  const keys = Array.from(new Set([...Object.keys(personA.scores ?? {}), ...Object.keys(personB.scores ?? {})]));
  const trendEntries = await Promise.all(keys.map(async (key) => [key, await getPublishedTrendByKey(key)] as const));
  return NextResponse.json(buildCompatibilityResult(personA, personB, new Map(trendEntries)));
}

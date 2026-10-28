import { NextRequest, NextResponse } from "next/server";

import { getMatchingSuggestions, matchingEnabled, publicMatchingProfile } from "@/lib/matching";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching sắp ra mắt." }, { status: 503 });
  const rate = rateLimit(request, "matching-suggestions", 10, 60_000); if (!rate.ok) return rateLimitResponse(rate.retryAfter);
  const result = await getMatchingSuggestions();
  if (!result.userId) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  if (result.needsV4) return NextResponse.json({ error: "Bạn cần hoàn thành bài test tài chính mới nhất trước khi bật Matching.", needsV4: true }, { status: 409 });
  return NextResponse.json({ suggestions: result.suggestions.map((item) => ({ id: item.id, compatibilityScore: item.compatibilityScore, profile: publicMatchingProfile(item.profile as Record<string, unknown>) })) });
}

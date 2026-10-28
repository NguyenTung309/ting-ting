import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { speedDatingEnabled } from "@/lib/matching";
import { getAppRecordClient } from "@/lib/app-database";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { calculateFinancialSimilarity } from "@/lib/speed-dating/compatibility";
import { isAdult } from "@/lib/speed-dating/eligibility";
import { toPublicDiscoveryProfile } from "@/lib/speed-dating/discovery";
import { findLatestV4Result, findOwnProfile, findPublicProfile, isPairExcluded, recordExposure } from "@/lib/speed-dating/repository";

function unavailable() {
  return NextResponse.json({ enabled: false, feature: "speed-dating", error: "Speed Dating sắp ra mắt." }, { status: 503 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  if (!speedDatingEnabled()) return unavailable();
  const rate = rateLimit(request, "speed-dating-profile", 30, 60_000);
  if (!rate.ok) return rateLimitResponse(rate.retryAfter);
  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  const { publicId } = await params;
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  if (!publicId || /^\d+$/.test(publicId)) return NextResponse.json({ error: "Hồ sơ không hợp lệ." }, { status: 400 });

  const [candidate, own, ownResult] = await Promise.all([findPublicProfile(cms, publicId), findOwnProfile(cms, userId), findLatestV4Result(cms, userId)]);
  if (!candidate || candidate.userId === userId || !candidate.enabled || candidate.status !== "active" || !candidate.dateOfBirth || !isAdult(candidate.dateOfBirth) || candidate.quizFormulaVersion !== 4 || !candidate.characterId || !candidate.personalityCode) return NextResponse.json({ error: "Không tìm thấy hồ sơ này." }, { status: 404 });
  if (!own || !ownResult || ownResult.formulaVersion !== 4) return NextResponse.json({ error: "Bạn cần có kết quả bài test tài chính mới nhất trước khi xem hồ sơ." }, { status: 409 });
  if (await isPairExcluded(cms, userId, candidate.userId)) return NextResponse.json({ error: "Hồ sơ này không còn khả dụng." }, { status: 404 });

  await recordExposure(cms, userId, candidate.userId, `detail:${userId}:${publicId}`, "opened");
  return NextResponse.json(toPublicDiscoveryProfile({ ...candidate, financialSimilarity: calculateFinancialSimilarity(ownResult.scores, candidate.scores) }));
}

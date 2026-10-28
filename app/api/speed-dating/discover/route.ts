import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { speedDatingEnabled } from "@/lib/matching";
import { getAppRecordClient } from "@/lib/app-database";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createDiscoveryBatch } from "@/lib/speed-dating/discovery";
import { findDiscoveryCandidates, findLatestV4Result, findOwnProfile, recordBatchExposures } from "@/lib/speed-dating/repository";

function unavailable() {
  return NextResponse.json({ enabled: false, feature: "speed-dating", error: "Speed Dating sắp ra mắt." }, { status: 503 });
}

export async function GET(request: NextRequest) {
  if (!speedDatingEnabled()) return unavailable();
  const rate = rateLimit(request, "speed-dating-discover", 10, 60_000);
  if (!rate.ok) return rateLimitResponse(rate.retryAfter);

  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập để khám phá." }, { status: 401 });

  const [own, result] = await Promise.all([findOwnProfile(cms, userId), findLatestV4Result(cms, userId)]);
  if (!own) return NextResponse.json({ error: "Bạn cần tạo hồ sơ Speed Dating trước.", needsProfile: true }, { status: 409 });
  if (!own.enabled || own.status !== "active") return NextResponse.json({ error: "Hãy bật hồ sơ để bắt đầu khám phá.", needsProfile: true }, { status: 409 });
  if (!result || result.formulaVersion !== 4) return NextResponse.json({ error: "Bạn cần có kết quả bài test tài chính mới nhất trước khi khám phá.", needsV4: true }, { status: 409 });

  const candidates = await findDiscoveryCandidates(cms, userId);
  const batch = createDiscoveryBatch(candidates);
  const selected = candidates.filter((candidate) => batch.profiles.some((profile) => profile.publicId === candidate.publicId));
  await recordBatchExposures(cms, userId, selected, batch.batchId);
  return NextResponse.json(batch);
}

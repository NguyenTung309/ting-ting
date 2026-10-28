import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { speedDatingEnabled } from "@/lib/matching";
import { getAppRecordClient } from "@/lib/app-database";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { findPublicProfile, isPairExcluded, recordExposure } from "@/lib/speed-dating/repository";

const bodySchema = z.object({ batchId: z.string().trim().max(120).optional() });

function unavailable() {
  return NextResponse.json({ enabled: false, feature: "speed-dating", error: "Speed Dating sắp ra mắt." }, { status: 503 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  if (!speedDatingEnabled()) return unavailable();
  const rate = rateLimit(request, "speed-dating-pass", 30, 60_000);
  if (!rate.ok) return rateLimitResponse(rate.retryAfter);
  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  const { publicId } = await params;
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  if (!publicId || /^\d+$/.test(publicId)) return NextResponse.json({ error: "Hồ sơ không hợp lệ." }, { status: 400 });

  const candidate = await findPublicProfile(cms, publicId);
  if (!candidate || candidate.userId === userId || !candidate.enabled || candidate.status !== "active") return NextResponse.json({ error: "Không tìm thấy hồ sơ này." }, { status: 404 });
  if (await isPairExcluded(cms, userId, candidate.userId)) return NextResponse.json({ error: "Hồ sơ này không còn khả dụng." }, { status: 404 });
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  const batchId = body.success && body.data.batchId ? body.data.batchId : `pass:${Date.now()}`;
  const exposure = await recordExposure(cms, userId, candidate.userId, batchId, "passed");
  const cooldownUntil = (exposure as unknown as { cooldownUntil?: unknown }).cooldownUntil;
  return NextResponse.json({ success: true, cooldownUntil: typeof cooldownUntil === "string" ? cooldownUntil : null });
}

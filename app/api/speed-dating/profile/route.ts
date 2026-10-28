import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { speedDatingEnabled } from "@/lib/matching";
import { isAdult, isValidDateOnly } from "@/lib/speed-dating/eligibility";
import { findLatestV4Result, findOwnProfile } from "@/lib/speed-dating/repository";
import { profileFields, validateProfileInput } from "@/lib/speed-dating/profiles";

function unavailable() {
  return NextResponse.json({ enabled: false, feature: "speed-dating", error: "Speed Dating sắp ra mắt." }, { status: 503 });
}

export async function GET() {
  if (!speedDatingEnabled()) return unavailable();
  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const profile = await findOwnProfile(cms, userId);
  const user = await cms.findByID({ collection: "users", id: userId, overrideAccess: true });
  return NextResponse.json({
    profile: profile ? {
      publicId: profile.publicId,
      dateOfBirth: typeof user.dateOfBirth === "string" ? user.dateOfBirth : profile.dateOfBirth,
      alias: profile.alias,
      ageBand: profile.ageBand,
      region: profile.region,
      bio: profile.bio,
      motto: profile.motto,
      interests: profile.interests,
      preferences: profile.preferences,
      enabled: profile.enabled,
      status: profile.status,
      characterId: profile.characterId,
      personalityCode: profile.personalityCode,
    } : null,
  });
}

export async function PUT(request: NextRequest) {
  if (!speedDatingEnabled()) return unavailable();
  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });

  const parsed = validateProfileInput(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Hồ sơ chưa đủ thông tin." }, { status: 400 });
  const input = parsed.data;
  const birthDate = new Date(`${input.dateOfBirth}T00:00:00.000Z`);
  if (!isValidDateOnly(input.dateOfBirth) || Number.isNaN(birthDate.getTime()) || birthDate.getTime() > Date.now()) return NextResponse.json({ error: "Ngày sinh không hợp lệ." }, { status: 400 });
  if (input.enabled && !isAdult(input.dateOfBirth)) return NextResponse.json({ error: "Speed Dating chỉ dành cho người từ 18 tuổi." }, { status: 400 });

  const [existing, latestResult] = await Promise.all([findOwnProfile(cms, userId), findLatestV4Result(cms, userId)]);
  if (input.enabled && (!latestResult || latestResult.formulaVersion !== 4 || !latestResult.personalityCode || !latestResult.characterId)) {
    return NextResponse.json({ error: "Bạn cần có kết quả bài test tài chính mới nhất trước khi tham gia Speed Dating.", needsV4: true }, { status: 409 });
  }

  await cms.update({ collection: "users", id: userId, data: { dateOfBirth: birthDate.toISOString() }, overrideAccess: true });
  const resultFields = latestResult && latestResult.formulaVersion === 4 ? latestResult : undefined;
  const data = {
    ...profileFields(input, resultFields),
    user: Number(userId),
    publicId: existing?.publicId || randomUUID(),
    status: input.enabled ? "active" as const : existing?.status === "active" ? "paused" as const : "draft" as const,
  };
  const saved = existing
    ? await cms.update({ collection: "matching-profiles", id: existing.id, data, overrideAccess: true })
    : await cms.create({ collection: "matching-profiles", data, overrideAccess: true });
  return NextResponse.json({ profile: { publicId: String((saved as unknown as Record<string, unknown>).publicId || data.publicId), enabled: input.enabled, status: data.status, ageBand: data.ageBand || null, characterId: data.characterId || null, personalityCode: data.personalityCode || null } });
}

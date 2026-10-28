import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { ageBandForBirthDate, isAdult, matchingEnabled } from "@/lib/matching";

const schema = z.object({ birthDate: z.string().datetime().or(z.string().date()), alias: z.string().trim().min(2).max(40), region: z.string().trim().max(80).optional(), bio: z.string().trim().max(500).optional(), motto: z.string().trim().max(160).optional(), preferences: z.record(z.string(), z.unknown()).optional(), enabled: z.boolean() });

export async function GET() {
  if (!matchingEnabled()) return NextResponse.json({ enabled: false, feature: "matching" });
  const userId = await getCurrentUserId(); const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const result = await cms.find({ collection: "matching-profiles", where: { user: { equals: userId } }, limit: 1, depth: 0, overrideAccess: true });
  const row = result.docs[0] as unknown as Record<string, unknown> | undefined;
  return NextResponse.json({ profile: row ? { id: row.id, birthDate: row.birthDate, alias: row.alias, ageBand: row.ageBand, region: row.region, bio: row.bio, motto: row.motto, preferences: row.preferences, enabled: row.enabled, status: row.status } : null });
}

export async function PUT(request: NextRequest) {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching chưa được bật." }, { status: 503 });
  const userId = await getCurrentUserId(); const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Hồ sơ Matching chưa đủ thông tin." }, { status: 400 });
  if (parsed.data.enabled && !isAdult(parsed.data.birthDate)) return NextResponse.json({ error: "Matching chỉ dành cho người từ 18 tuổi." }, { status: 400 });
  const result = await cms.find({ collection: "matching-profiles", where: { user: { equals: userId } }, limit: 1, overrideAccess: true });
  const data = { ...parsed.data, ageBand: ageBandForBirthDate(parsed.data.birthDate) as "18-24" | "25-34" | "35-44" | "45-plus", status: "active" as const, user: Number(userId) };
  const row = result.docs[0] ? await cms.update({ collection: "matching-profiles", id: result.docs[0].id, data, overrideAccess: true }) : await cms.create({ collection: "matching-profiles", data, overrideAccess: true });
  const safe = row as unknown as Record<string, unknown>;
  return NextResponse.json({ profile: { id: safe.id, alias: safe.alias, ageBand: safe.ageBand, region: safe.region, bio: safe.bio, motto: safe.motto, enabled: safe.enabled, status: safe.status } });
}

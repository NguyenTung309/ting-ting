import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";

const profileSchema = z.object({ displayName: z.string().trim().min(2).max(80).optional(), avatar: z.string().url().max(500).optional(), consentVersion: z.string().max(40).optional() });

async function getUser() {
  const id = await getCurrentUserId();
  const cms = await getAppRecordClient();
  if (!id || !cms) return null;
  try {
    const result = await cms.findByID({ collection: "users", id, overrideAccess: true });
    return { id, cms, user: result as unknown as Record<string, unknown> };
  } catch {
    return null;
  }
}

export async function GET() {
  const result = await getUser();
  if (!result) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  return NextResponse.json({ id: result.id, email: result.user.email, displayName: result.user.displayName, avatar: result.user.avatar, status: result.user.status, consentVersion: result.user.consentVersion });
}

export async function PATCH(request: NextRequest) {
  const result = await getUser();
  if (!result) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thông tin hồ sơ không hợp lệ." }, { status: 400 });
  const updated = await result.cms.update({ collection: "users", id: result.id, data: parsed.data, overrideAccess: true });
  return NextResponse.json({ id: updated.id, email: updated.email, displayName: updated.displayName, avatar: updated.avatar, status: updated.status });
}

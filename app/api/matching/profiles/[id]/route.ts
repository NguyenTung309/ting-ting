import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { matchingEnabled, publicMatchingProfile } from "@/lib/matching";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const cms = await getAppRecordClient(); const { id } = await params;
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const result = await cms.findByID({ collection: "matching-profiles", id, depth: 0, overrideAccess: true }).catch(() => null);
  if (!result || !result.enabled || result.status !== "active") return NextResponse.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });
  return NextResponse.json({ profile: publicMatchingProfile(result as unknown as Record<string, unknown>) });
}

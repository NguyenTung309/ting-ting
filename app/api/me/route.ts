import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";

export async function DELETE() {
  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  await cms.update({ collection: "users", id: userId, data: { status: "deleted", displayName: "Tài khoản đã xóa" }, overrideAccess: true });
  await cms.create({ collection: "audit-logs", data: { action: "delete-account", actor: Number(userId), targetType: "user", targetId: userId }, overrideAccess: true });
  const profile = await cms.find({ collection: "matching-profiles", where: { user: { equals: userId } }, limit: 1, overrideAccess: true });
  if (profile.docs[0]) await cms.update({ collection: "matching-profiles", id: profile.docs[0].id, data: { enabled: false, status: "suspended" }, overrideAccess: true });
  return NextResponse.json({ success: true });
}

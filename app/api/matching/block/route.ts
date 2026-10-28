import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { matchingEnabled } from "@/lib/matching";

export async function POST(request: NextRequest) {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching sắp ra mắt." }, { status: 503 });
  const actor = await getCurrentUserId(); const cms = await getAppRecordClient(); const parsed = z.object({ userId: z.union([z.string(), z.number()]), reason: z.string().max(240).optional() }).safeParse(await request.json().catch(() => null));
  if (!actor || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  if (!parsed.success || String(parsed.data.userId) === actor) return NextResponse.json({ error: "Đối tượng block không hợp lệ." }, { status: 400 });
  await cms.create({ collection: "blocks", data: { blocker: Number(actor), blocked: Number(parsed.data.userId), reason: parsed.data.reason }, overrideAccess: true });
  await cms.create({ collection: "audit-logs", data: { action: "block", actor: Number(actor), targetType: "user", targetId: String(parsed.data.userId), metadata: { reason: parsed.data.reason } }, overrideAccess: true });
  const requests = await cms.find({ collection: "connection-requests", where: { or: [{ and: [{ sender: { equals: actor } }, { receiver: { equals: String(parsed.data.userId) } }] }, { and: [{ sender: { equals: String(parsed.data.userId) } }, { receiver: { equals: actor } }] }] }, limit: 10, overrideAccess: true });
  for (const item of requests.docs) await cms.update({ collection: "connection-requests", id: item.id, data: { status: "blocked" }, overrideAccess: true });
  return NextResponse.json({ success: true });
}

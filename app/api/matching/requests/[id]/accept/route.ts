import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { matchingEnabled } from "@/lib/matching";
import { idOf } from "@/lib/chat";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const cms = await getAppRecordClient(); const { id } = await params;
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const requestDoc = await cms.findByID({ collection: "connection-requests", id, overrideAccess: true }).catch(() => null);
  if (!requestDoc || idOf(requestDoc.receiver) !== userId || requestDoc.status !== "pending") return NextResponse.json({ error: "Lời chào không còn khả dụng." }, { status: 404 });
  const accepted = await cms.update({ collection: "connection-requests", id, data: { status: "accepted" }, overrideAccess: true });
  const conversation = await cms.create({ collection: "conversations", data: { connectionRequest: accepted.id, status: "active" }, overrideAccess: true });
  await cms.create({ collection: "conversation-members", data: { conversation: conversation.id, user: Number(idOf(accepted.sender)) }, overrideAccess: true });
  await cms.create({ collection: "conversation-members", data: { conversation: conversation.id, user: Number(idOf(accepted.receiver)) }, overrideAccess: true });
  return NextResponse.json({ success: true, conversationId: conversation.id });
}

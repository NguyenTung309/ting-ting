import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { chatEnabled, idOf } from "@/lib/chat";

export async function GET() {
  if (!chatEnabled()) return NextResponse.json({ error: "Chat sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const members = await cms.find({ collection: "conversation-members", where: { user: { equals: userId } }, limit: 100, overrideAccess: true });
  const conversations = [];
  for (const member of members.docs as unknown as Record<string, unknown>[]) {
    const conversationId = idOf(member.conversation); const conversation = await cms.findByID({ collection: "conversations", id: conversationId, overrideAccess: true }).catch(() => null);
    if (!conversation) continue;
    const messages = await cms.find({ collection: "messages", where: { conversation: { equals: conversationId } }, sort: "-createdAt", limit: 1, overrideAccess: true });
    const last = messages.docs[0] as unknown as Record<string, unknown> | undefined;
    const unread = member.lastReadAt ? await cms.find({ collection: "messages", where: { and: [{ conversation: { equals: conversationId } }, { createdAt: { greater_than: member.lastReadAt } }, { sender: { not_equals: userId } }] }, limit: 100, overrideAccess: true }) : { totalDocs: 0 };
    conversations.push({ id: conversationId, status: conversation.status, lastReadAt: member.lastReadAt, unreadCount: unread.totalDocs, lastMessage: last ? { body: last.body, createdAt: last.createdAt, senderId: idOf(last.sender) } : null });
  }
  return NextResponse.json({ conversations });
}

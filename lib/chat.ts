import { getAppRecordClient } from "@/lib/app-database";

export function chatEnabled() { return process.env.CHAT_ENABLED === "true"; }

export function idOf(value: unknown) {
  if (typeof value === "object" && value && "id" in value) return String((value as { id: unknown }).id);
  return value == null ? "" : String(value);
}

export async function getConversationForMember(conversationId: string, userId: string) {
  const cms = await getAppRecordClient();
  if (!cms) return null;
  const members = await cms.find({ collection: "conversation-members", where: { and: [{ conversation: { equals: conversationId } }, { user: { equals: userId } }] }, limit: 1, overrideAccess: true });
  if (!members.docs[0]) return null;
  const conversation = await cms.findByID({ collection: "conversations", id: conversationId, overrideAccess: true }).catch(() => null);
  return conversation ? { cms, conversation, member: members.docs[0] } : null;
}

export function safeMessage(row: Record<string, unknown>) {
  return { id: String(row.id), conversationId: idOf(row.conversation), senderId: idOf(row.sender), body: typeof row.body === "string" ? row.body : "", messageType: row.messageType || "text", createdAt: row.createdAt, updatedAt: row.updatedAt };
}

import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { chatEnabled, getConversationForMember } from "@/lib/chat";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!chatEnabled()) return NextResponse.json({ error: "Chat sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const { id } = await params; const result = userId ? await getConversationForMember(id, userId) : null;
  if (!result) return NextResponse.json({ error: "Bạn không có quyền cập nhật cuộc trò chuyện này." }, { status: 403 });
  await result.cms.update({ collection: "conversation-members", id: result.member.id, data: { lastReadAt: new Date().toISOString() }, overrideAccess: true });
  return NextResponse.json({ success: true, lastReadAt: new Date().toISOString() });
}

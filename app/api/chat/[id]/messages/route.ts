import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { chatEnabled, getConversationForMember, safeMessage } from "@/lib/chat";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({ body: z.string().trim().min(1).max(2000), messageType: z.enum(["text", "emoji"]).default("text") });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!chatEnabled()) return NextResponse.json({ error: "Chat sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const { id } = await params; const result = userId ? await getConversationForMember(id, userId) : null;
  if (!result) return NextResponse.json({ error: "Bạn không có quyền xem cuộc trò chuyện này." }, { status: 403 });
  const messages = await result.cms.find({ collection: "messages", where: { conversation: { equals: id } }, sort: "createdAt", limit: 200, overrideAccess: true });
  return NextResponse.json({ messages: (messages.docs as unknown as Record<string, unknown>[]).map(safeMessage) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!chatEnabled()) return NextResponse.json({ error: "Chat sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const { id } = await params; const result = userId ? await getConversationForMember(id, userId) : null;
  if (!result) return NextResponse.json({ error: "Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này." }, { status: 403 });
  const rate = rateLimit(request, "chat-message", 30, 60_000); if (!rate.ok) return rateLimitResponse(rate.retryAfter);
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Tin nhắn tối đa 2.000 ký tự." }, { status: 400 });
  const created = await result.cms.create({ collection: "messages", data: { conversation: Number(id), sender: Number(userId), body: parsed.data.body, messageType: parsed.data.messageType }, overrideAccess: true });
  return NextResponse.json({ message: safeMessage(created as unknown as Record<string, unknown>) });
}

import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { chatEnabled, getConversationForMember, idOf } from "@/lib/chat";
import { getPrivateObject } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  if (!chatEnabled()) return NextResponse.json({ error: "Chat sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const cms = await getAppRecordClient(); const { filename } = await params;
  if (!userId || !cms || !/^[a-f0-9-]+\.(jpg|png|webp)$/.test(filename)) return NextResponse.json({ error: "Không tìm thấy file." }, { status: 404 });
  const result = await cms.find({ collection: "message-attachments", where: { url: { equals: `/api/chat/attachments/${filename}` } }, limit: 1, depth: 0, overrideAccess: true });
  const attachment = result.docs[0] as unknown as Record<string, unknown> | undefined; if (!attachment) return NextResponse.json({ error: "Không tìm thấy file." }, { status: 404 });
  const message = await cms.findByID({ collection: "messages", id: idOf(attachment.message), depth: 0, overrideAccess: true }).catch(() => null); if (!message) return NextResponse.json({ error: "Không tìm thấy file." }, { status: 404 });
  const conversation = idOf(message.conversation); if (!await getConversationForMember(conversation, userId)) return NextResponse.json({ error: "Không có quyền." }, { status: 403 });
  try { const object = await getPrivateObject(`chat/${filename}`); return new NextResponse(object.data, { headers: { "content-type": String(attachment.mimeType || object.contentType || "application/octet-stream"), "cache-control": "private, max-age=3600" } }); } catch { return NextResponse.json({ error: "Không tìm thấy file." }, { status: 404 }); }
}

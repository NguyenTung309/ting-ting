import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { chatEnabled, getConversationForMember } from "@/lib/chat";
import { putPrivateObject } from "@/lib/storage";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!chatEnabled()) return NextResponse.json({ error: "Chat sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const { id } = await params; const result = userId ? await getConversationForMember(id, userId) : null;
  if (!result) return NextResponse.json({ error: "Bạn không có quyền gửi file trong cuộc trò chuyện này." }, { status: 403 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Ảnh phải là JPEG, PNG hoặc WebP và không quá 10MB." }, { status: 400 });
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`; await putPrivateObject(`chat/${filename}`, new Uint8Array(await file.arrayBuffer()), file.type);
  const message = await result.cms.create({ collection: "messages", data: { conversation: Number(id), sender: Number(userId), body: file.name.slice(0, 2000), messageType: "image" }, overrideAccess: true });
  const attachment = await result.cms.create({ collection: "message-attachments", data: { message: Number(message.id), filename: file.name.slice(0, 180), mimeType: file.type, size: file.size, url: `/api/chat/attachments/${filename}` }, overrideAccess: true });
  return NextResponse.json({ attachment: { id: attachment.id, url: attachment.url, filename: attachment.filename, mimeType: attachment.mimeType, size: attachment.size } });
}

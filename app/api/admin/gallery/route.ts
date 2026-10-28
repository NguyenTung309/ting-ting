import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAdminPayload } from "@/lib/admin-content";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    const payload = await getAdminPayload();
    const result = await payload.find({ collection: "media", sort: "-updatedAt", limit: 100, overrideAccess: true });
    return NextResponse.json({
      total: result.totalDocs,
      items: result.docs.map((item) => ({ id: String(item.id), url: String(item.url || ""), alt: String(item.alt || ""), filename: String(item.filename || ""), width: item.width || null, height: item.height || null, updatedAt: String(item.updatedAt || "") })),
    });
  } catch {
    return NextResponse.json({ error: "Không tải được thư viện ảnh." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  let tempDir = "";
  try {
    const form = await request.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") || "").trim().slice(0, 300);
    if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Chọn một tệp ảnh để tải lên." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Thư viện chỉ nhận tệp ảnh." }, { status: 400 });
    if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Ảnh cần nhỏ hơn 12 MB." }, { status: 413 });
    if (!alt) return NextResponse.json({ error: "Nhập văn bản thay thế cho ảnh." }, { status: 400 });

    const extension = path.extname(file.name).replace(/[^.a-zA-Z0-9]/g, "").slice(0, 12) || ".img";
    const filename = `${randomUUID()}${extension}`;
    tempDir = await mkdtemp(path.join(os.tmpdir(), "ttt-admin-media-"));
    const filePath = path.join(tempDir, filename);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    const payload = await getAdminPayload();
    const item = await payload.create({ collection: "media", data: { alt }, filePath, overrideAccess: true });
    return NextResponse.json({ item: { id: String(item.id), url: String(item.url || ""), alt: String(item.alt || ""), filename: String(item.filename || filename), width: item.width || null, height: item.height || null } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Tải ảnh lên chưa thành công." }, { status: 400 });
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

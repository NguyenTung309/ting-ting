import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { adminPostSummary, getAdminPayload } from "@/lib/admin-content";
import { parseAdminPostData } from "@/lib/admin-post-input";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 }); }
  const parsed = parseAdminPostData(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const payload = await getAdminPayload();
    const post = await payload.update({ collection: "posts", id: Number(id) || id, data: parsed.data, depth: 1, draft: true, overrideAccess: true });
    return NextResponse.json({ post: adminPostSummary(post as unknown as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ error: "Không cập nhật được bài viết." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  try {
    const payload = await getAdminPayload();
    await payload.delete({ collection: "posts", id: Number(id) || id, overrideAccess: true });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Không xóa được bài viết." }, { status: 404 });
  }
}

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAdminPayload } from "@/lib/admin-content";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  try {
    const payload = await getAdminPayload();
    await payload.delete({ collection: "media", id: Number(id) || id, overrideAccess: true });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Không xóa được hình ảnh." }, { status: 404 });
  }
}

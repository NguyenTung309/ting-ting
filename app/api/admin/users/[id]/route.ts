import { NextResponse } from "next/server";

import { isAdminEmail, requireAdminApi } from "@/lib/admin-auth";
import { getAppRecordClient } from "@/lib/app-database";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const records = getAppRecordClient();
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });

  try {
    const body = await request.json() as { status?: unknown };
    if (body.status !== "active" && body.status !== "blocked") return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
    const user = await records.findByID({ collection: "users", id, overrideAccess: true });
    if (user.accountType === "admin" || isAdminEmail(String(user.email || ""))) return NextResponse.json({ error: "Không thể khóa tài khoản quản trị." }, { status: 400 });
    const updated = await records.update({ collection: "users", id, data: { status: body.status }, overrideAccess: true });
    return NextResponse.json({ id: String(updated.id), status: updated.status });
  } catch {
    return NextResponse.json({ error: "Không cập nhật được người dùng." }, { status: 404 });
  }
}

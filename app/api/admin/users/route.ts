import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAppRecordClient } from "@/lib/app-database";
import { isAdminAccountEmail } from "@/lib/user-roles";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const records = getAppRecordClient();
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });
  const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1);

  try {
    const firstPage = await records.find({ collection: "users", sort: "-lastSeenAt", limit: 500, page: 1, overrideAccess: true });
    const allUsers = [...firstPage.docs];
    for (let currentPage = 2; currentPage <= firstPage.totalPages; currentPage += 1) {
      const next = await records.find({ collection: "users", sort: "-lastSeenAt", limit: 500, page: currentPage, overrideAccess: true });
      allUsers.push(...next.docs);
    }
    const users = allUsers.filter((user) => user.accountType !== "admin" && !isAdminAccountEmail(String(user.email || "")));
    const pageSize = 25;
    const totalPages = Math.ceil(users.length / pageSize);
    const result = users.slice((page - 1) * pageSize, page * pageSize);
    return NextResponse.json({
      total: users.length,
      page,
      totalPages,
      items: result.map((user) => ({
        id: String(user.id),
        name: String(user.displayName || user.name || "Chưa cập nhật"),
        email: String(user.email || ""),
        avatar: String(user.avatar || ""),
        status: user.status === "blocked" ? "blocked" : "active",
        accountType: "user",
        createdAt: String(user.createdAt || ""),
        lastSeenAt: String(user.lastSeenAt || user.updatedAt || ""),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Không tải được danh sách người dùng." }, { status: 503 });
  }
}

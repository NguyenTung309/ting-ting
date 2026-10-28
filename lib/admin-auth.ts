import "server-only";

import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && adminEmails.has(email.trim().toLowerCase()));
}

export async function getAdminSession() {
  const session = await getCurrentSession();
  return isAdminEmail(session?.user?.email) ? session : null;
}

export async function requireAdminApi() {
  const session = await getCurrentSession();
  if (!session?.user?.email) {
    return {
      session: null,
      response: NextResponse.json({ error: "Vui lòng đăng nhập bằng Google." }, { status: 401 }),
    };
  }
  if (!isAdminEmail(session.user.email)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Tài khoản này không có quyền quản trị." }, { status: 403 }),
    };
  }
  return { session, response: null };
}

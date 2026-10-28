import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session?.user) redirect("/admin/sign-in?error=not-authorized");

  return (
    <AdminShell
      name={session.user.name || "Quản trị viên"}
      email={session.user.email || ""}
      avatar={session.user.image || ""}
    >
      {children}
    </AdminShell>
  );
}

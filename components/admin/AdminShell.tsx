"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: "grid" },
  { href: "/admin/submissions", label: "Lượt làm bài", icon: "chart" },
  { href: "/admin/tests", label: "Bộ câu hỏi", icon: "document" },
  { href: "/admin/users", label: "Người dùng", icon: "users" },
  { href: "/admin/posts", label: "Bài viết blog", icon: "document" },
  { href: "/admin/gallery", label: "Thư viện ảnh", icon: "image" },
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 4-4 3 2 5-7" /><path d="M16 6h3v3" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{paths[name]}</svg>;
}

export function AdminShell({ name, email, children }: { name: string; email: string; avatar?: string; children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const title = navItems.find((item) => item.href === pathname || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)))?.label || "Quản trị";
  const initials = name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-[#1d2939]">
      {menuOpen && <button aria-label="Đóng menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-[#101828]/45 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[#eaecf0] bg-white transition-transform duration-200 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Link href="/admin" className="flex h-[84px] items-center gap-3 border-b border-[#f0f1f5] px-7" onClick={() => setMenuOpen(false)}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff4164] text-xl font-bold text-white shadow-[0_8px_18px_rgba(255,65,100,0.25)]">T</span>
          <span className="min-w-0">
            <strong className="block text-[15px] font-bold tracking-tight text-[#1d2939]">Ting Ting Admin</strong>
            <span className="mt-0.5 block text-xs text-[#98a2b3]">Quản trị nội dung</span>
          </span>
        </Link>
        <div className="px-5 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#98a2b3]">Menu quản trị</p>
          <nav aria-label="Điều hướng quản trị" className="space-y-1.5">
            {navItems.map((item) => {
              const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? "bg-[#fff0f3] text-[#f23b5e]" : "text-[#667085] hover:bg-[#f7f8fb] hover:text-[#344054]"}`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ff4164]" />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-5">
          <div className="rounded-2xl bg-[#fff7f1] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#344054]"><span className="text-lg">✦</span> Khu vực quản trị</div>
            <p className="text-xs leading-5 text-[#667085]">Dữ liệu blog và thư viện ảnh trên Payload, hoạt động cùng website.</p>
            <Link href="/" target="_blank" className="mt-3 inline-flex text-xs font-bold text-[#f23b5e] hover:underline">Mở website ↗</Link>
          </div>
          <p className="mt-5 px-1 text-[11px] text-[#98a2b3]">Tình Tính Ting Ting · Admin</p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#eaecf0] bg-white/95 px-4 backdrop-blur-sm sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Mở menu" onClick={() => setMenuOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eaecf0] text-[#475467] lg:hidden">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="min-w-0">
              <p className="hidden text-xs font-medium text-[#98a2b3] sm:block">Ting Ting Admin <span className="px-1">/</span> {title}</p>
              <h1 className="truncate text-base font-bold text-[#1d2939] sm:mt-1 sm:text-lg">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden text-right sm:block"><strong className="block max-w-[210px] truncate text-sm font-semibold text-[#344054]">{name}</strong><span className="block max-w-[210px] truncate text-xs text-[#98a2b3]">{email}</span></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4164] text-sm font-bold text-white">{initials}</span>
            <button onClick={() => signOut({ callbackUrl: "/admin/sign-in" })} className="rounded-lg border border-[#eaecf0] px-3 py-2 text-xs font-semibold text-[#667085] transition hover:bg-[#f9fafb] hover:text-[#344054]">Thoát</button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-7 lg:p-9">{children}</main>
      </div>
    </div>
  );
}

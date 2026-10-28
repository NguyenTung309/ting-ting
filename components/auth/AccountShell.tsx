import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/tai-khoan", label: "Tổng quan", key: "home" },
  { href: "/tai-khoan/ho-so", label: "Hồ sơ", key: "profile" },
  { href: "/tai-khoan/ket-qua", label: "Kết quả đã lưu", key: "results" },
];

export function AccountShell({ active, children }: { active: "home" | "profile" | "results"; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Tình Tính Ting Ting</p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] text-[var(--ink)]">Tài khoản của bạn</h1>
      <nav aria-label="Điều hướng tài khoản" className="my-7 flex flex-wrap gap-2">
        {links.map((link) => <Link key={link.key} href={link.href} aria-current={active === link.key ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-semibold ${active === link.key ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)] text-[var(--ink)]"}`}>{link.label}</Link>)}
      </nav>
      {children}
    </section>
  );
}

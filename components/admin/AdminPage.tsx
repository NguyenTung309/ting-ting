import type { ReactNode } from "react";

export function AdminPage({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1d2939] sm:text-[28px]">{title}</h2>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-[#667085]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AdminPanel({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#eaecf0] bg-white p-5 shadow-[0_2px_8px_rgba(16,24,40,0.03)] sm:p-6 ${className}`}>
      {(title || action) && <div className="mb-5 flex items-center justify-between gap-4"><h3 className="text-base font-bold text-[#344054]">{title}</h3>{action}</div>}
      {children}
    </section>
  );
}

export function LoadingState({ error }: { error?: string | null }) {
  return <div className="rounded-2xl border border-[#eaecf0] bg-white px-5 py-12 text-center text-sm text-[#667085]">{error || "Đang tải dữ liệu…"}</div>;
}

export function StatusPill({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "orange" | "red" }) {
  const tones = { gray: "bg-[#f2f4f7] text-[#475467]", green: "bg-[#ecfdf3] text-[#027a48]", orange: "bg-[#fffaeb] text-[#b54708]", red: "bg-[#fef3f2] text-[#b42318]" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-[#d0d5dd] px-5 py-10 text-center text-sm text-[#98a2b3]">{children}</div>;
}

import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
};

const variants = {
  primary: "bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(200,90,80,0.18)] hover:bg-brand-dark active:translate-y-px",
  secondary: "border border-line bg-white/70 text-foreground hover:border-brand hover:text-brand-dark active:translate-y-px",
  quiet: "text-brand hover:text-brand-dark",
};

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function ResultAccessGate({ code, claim = false, inline = false }: {
  code: string;
  claim?: boolean;
  inline?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function continueWithGoogle() {
    setBusy(true); setError("");
    try {
      const callbackUrl = `/ket-qua/${encodeURIComponent(code)}${claim ? "?claim=1" : ""}`;
      await signIn("google", { callbackUrl });
    } catch {
      setError("Chưa thể mở đăng nhập lúc này. Bạn thử lại nhé.");
      setBusy(false);
    }
  }
  if (inline) return <section className="mx-auto my-10 max-w-3xl rounded-3xl border border-[#f5cbd3] bg-white px-6 py-8 text-center shadow-[0_12px_32px_rgba(126,60,53,0.06)] sm:px-10">
    <span className="grid size-12 mx-auto place-items-center rounded-2xl bg-[#fff0ea] text-2xl text-[var(--accent)]" aria-hidden="true">✦</span>
    <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Mở khóa kết quả</p>
    <h2 className="mt-2 text-2xl font-bold leading-tight text-[#f85174] sm:text-3xl">Xem phân tích chi tiết</h2>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">Đăng nhập bằng Google để xem điểm số, biểu đồ năm xu hướng và phần phân tích dành riêng cho kết quả của bạn.</p>
    <button type="button" onClick={() => void continueWithGoogle()} disabled={busy} className="mt-6 min-h-12 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a9433d] disabled:opacity-60">{busy ? "Đang chuyển đến Google…" : "Đăng nhập để xem phân tích"}</button>
    {error && <p role="alert" className="mt-4 text-sm text-[#b42318]">{error}</p>}
  </section>;

  return <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-12 text-center">
    <span className="grid size-16 place-items-center rounded-2xl bg-[#fff0ea] text-3xl text-[var(--accent)]" aria-hidden="true">✦</span>
    <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Kết quả bài test</p>
    <h1 className="mt-3 text-[26px] font-bold leading-[1.2] tracking-normal text-[#f85174] sm:text-4xl">Chưa tìm thấy kết quả này</h1>
    <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">Đăng nhập bằng Google để tiếp tục nhận kết quả và lưu lượt làm vào tài khoản của bạn.</p>
    <button type="button" onClick={() => void continueWithGoogle()} disabled={busy} className="mt-7 min-h-12 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a9433d] disabled:opacity-60">{busy ? "Đang chuyển đến Google…" : "Đăng nhập với Google"}</button>
    {error && <p role="alert" className="mt-4 text-sm text-[#b42318]">{error}</p>}
    <Link href="/test-xu-huong-tai-chinh" className="mt-5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)]">Làm bài test khác</Link>
  </section>;
}

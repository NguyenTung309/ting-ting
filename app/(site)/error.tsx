"use client";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Có một nhịp bị lỡ</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em] text-[var(--ink)]">Trang chưa mở được lúc này.</h1><p className="mt-4 leading-7 text-[var(--muted)]">Bạn thử tải lại nhé. Nếu lỗi vẫn còn, quay lại sau một chút.</p><button type="button" onClick={() => reset()} className="mt-7 min-h-11 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white">Thử lại</button></div>;
}

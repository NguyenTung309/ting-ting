import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-brand-dark">Trang này đang đi tìm mình.</h1>
      <p className="mt-4 text-muted">Có thể đường dẫn đã thay đổi hoặc câu chuyện này chưa được mở ra.</p>
      <Link href="/" className="mt-8 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark">Về trang chủ</Link>
    </div>
  );
}

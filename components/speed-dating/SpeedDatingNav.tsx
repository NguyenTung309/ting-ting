import Link from "next/link";

export function SpeedDatingNav() {
  return (
    <nav className="border-b border-[#e7d7c8] bg-[#fffaf1]/90 backdrop-blur" aria-label="Speed Dating">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/speed-dating" className="text-sm font-black tracking-[-0.04em] text-[#49352e]">
          TÌNH TÍNH <span className="text-[#c85a50]">TING TING</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-bold text-[#806e62] md:flex">
          <Link className="transition hover:text-[#c85a50]" href="/speed-dating/discover">Khám phá</Link>
          <Link className="transition hover:text-[#c85a50]" href="/speed-dating/me">Hồ sơ của tôi</Link>
          <span className="cursor-not-allowed opacity-45" aria-disabled="true">Lời chào</span>
          <span className="cursor-not-allowed opacity-45" aria-disabled="true">Kết nối</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-around border-t border-[#e7d7c8] px-4 py-3 text-xs font-bold text-[#806e62] md:hidden">
        <Link href="/speed-dating/discover">Khám phá</Link>
        <span className="opacity-40" aria-disabled="true">Lời chào</span>
        <span className="opacity-40" aria-disabled="true">Kết nối</span>
        <Link href="/speed-dating/me">Tôi</Link>
      </div>
    </nav>
  );
}

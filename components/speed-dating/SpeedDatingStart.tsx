"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SpeedDatingProfileForm } from "./SpeedDatingProfileForm";

export function SpeedDatingStart() {
  const [state, setState] = useState<"loading" | "ready" | "login" | "soon">("loading");

  useEffect(() => { void fetch("/api/speed-dating/profile").then((response) => { if (response.status === 503) return "soon" as const; if (response.status === 401) return "login" as const; return "ready" as const; }).catch(() => "ready" as const).then(setState); }, []);

  if (state === "loading") return <div className="h-80 animate-pulse rounded-[2rem] bg-[#f0e3d5]" />;
  if (state === "soon") return <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#e7d7c8] bg-white p-8 text-center sm:p-12"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#c85a50]">Speed Dating</p><h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#49352e]">Sắp ra mắt</h1><p className="mt-4 leading-8 text-[#806e62]">Landing đã mở để bạn xem trước. Discovery sẽ được bật sau khi hoàn thiện bộ hồ sơ và chính sách an toàn.</p><Link href="/speed-dating" className="mt-7 inline-block rounded-full bg-[#49352e] px-6 py-3 text-sm font-black text-white">Quay lại landing</Link></div>;
  if (state === "login") return <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#e7d7c8] bg-white p-8 text-center sm:p-12"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#c85a50]">Bắt đầu hành trình</p><h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#49352e]">Tài khoản đang tạm đóng</h1><p className="mt-4 leading-8 text-[#806e62]">Luồng đăng nhập đang được tạm ẩn trong bản demo. Bạn vẫn có thể xem landing và các trạng thái Speed Dating.</p><Link href="/speed-dating" className="mt-7 inline-block rounded-full bg-[#49352e] px-6 py-3 text-sm font-black text-white">Quay lại Speed Dating</Link></div>;
  return <div><p className="eyebrow-mark text-xs font-black uppercase tracking-[0.2em] text-[#c85a50]">Onboarding</p><h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-[#49352e] sm:text-6xl">Tạo hồ sơ cùng tần số</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#806e62]">Hoàn thành thông tin tối thiểu, kiểm tra bạn đủ 18+ và bật hồ sơ khi sẵn sàng.</p><div className="mt-9 max-w-3xl"><SpeedDatingProfileForm /></div></div>;
}

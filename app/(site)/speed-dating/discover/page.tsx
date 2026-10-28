import { Container } from "@/components/site/Container";
import { SpeedDatingDiscovery } from "@/components/speed-dating/SpeedDatingDiscovery";

export const metadata = { title: "Khám phá Speed Dating" };

export default function SpeedDatingDiscoverPage() {
  return <Container className="py-10 sm:py-16"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow-mark text-xs font-black uppercase tracking-[0.2em] text-[#c85a50]">Discovery</p><h1 className="mt-3 text-5xl font-black tracking-[-0.08em] text-[#49352e]">Người được giới thiệu</h1><p className="mt-4 max-w-2xl leading-7 text-[#806e62]">Ba hồ sơ cùng tần số để bạn khám phá. Vuốt trái để bỏ qua; vuốt phải chỉ là một tín hiệu cho phase Hello sau này.</p></div><a href="/speed-dating/me" className="rounded-full border border-[#d6c2b1] px-5 py-3 text-sm font-black text-[#49352e]">Hồ sơ của tôi</a></div><div className="mt-9"><SpeedDatingDiscovery /></div></Container>;
}

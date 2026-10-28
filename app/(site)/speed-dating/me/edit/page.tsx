import { Container } from "@/components/site/Container";
import { SpeedDatingProfileForm } from "@/components/speed-dating/SpeedDatingProfileForm";

export const metadata = { title: "Chỉnh sửa hồ sơ Speed Dating" };

export default function SpeedDatingEditPage() { return <Container className="py-12 sm:py-20"><p className="eyebrow-mark text-xs font-black uppercase tracking-[0.2em] text-[#c85a50]">Hồ sơ của tôi</p><h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-[#49352e]">Chỉnh sửa hồ sơ</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#806e62]">Bạn kiểm soát hoàn toàn việc hồ sơ có xuất hiện trong Discovery hay không.</p><div className="mt-9 max-w-3xl"><SpeedDatingProfileForm /></div></Container>; }

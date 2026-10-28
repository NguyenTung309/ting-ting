import Link from "next/link";

import { Container } from "@/components/site/Container";
import { FigmaResultPage, ResultFeaturedTrend } from "@/components/tests/FigmaResultPage";
import { ResultAccessGate } from "@/components/tests/ResultAccessGate";
import { ResultClaimLink } from "@/components/tests/ResultClaimLink";
import { getCurrentUserId } from "@/lib/auth";
import { getOwnedResultByCode, getPublicResultByCode } from "@/lib/tests/submissions";
import { siteMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return siteMetadata({
    path: `/ket-qua/${encodeURIComponent(code)}`,
    title: "Kết quả bài test cá nhân",
    description: "Đăng nhập để xem kết quả bài test cá nhân của bạn.",
    indexable: false,
  });
}

export default async function ResultLookupPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ claim?: string }> }) {
  const { code } = await params;
  const [{ claim }, userId] = await Promise.all([searchParams, getCurrentUserId()]);
  if (!userId) {
    const preview = await getPublicResultByCode(code);
    if (!preview) return <Container><ResultAccessGate code={code} claim={claim === "1"} /></Container>;
    return <div className="figma-result-page" data-testid="result-preview">
      <ResultFeaturedTrend result={preview} />
      <ResultAccessGate code={code} claim={claim === "1"} inline />
    </div>;
  }
  if (claim === "1") return <Container className="flex min-h-[60vh] items-center justify-center py-12"><section className="max-w-md text-center"><h1 className="mb-4 text-3xl font-bold text-[var(--accent)]">Đang nhận kết quả của bạn</h1><ResultClaimLink code={code} enabled /></section></Container>;
  const result = await getOwnedResultByCode(code, userId);

  if (!result) return <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Mã không hợp lệ</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em] text-[var(--ink)]">Chưa tìm thấy kết quả này.</h1><p className="mt-4 max-w-md leading-7 text-[var(--muted)]">Bạn kiểm tra lại mã TTT gồm 5 ký tự sau dấu gạch ngang nhé.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/test-xu-huong-tai-chinh" className="min-h-11 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white">Làm Test mới</Link><Link href="/tuong-thich-doi" className="min-h-11 rounded-full border border-[#c99689] px-5 py-3 text-sm font-bold text-[var(--accent)]">Về Tương thích</Link></div></Container>;

  return <FigmaResultPage result={result} />;
}

import Image from "next/image";
import Link from "next/link";

import { getPublishedTrends } from "@/lib/trends/data";
import { TrendCoin } from "@/components/site/TrendCoin";
import { TrendFilter } from "@/components/site/TrendFilter";
import { figmaTrendOrder, trendDisplay } from "@/lib/trends/figma-display";
import { siteMetadata } from "@/lib/seo";

const baseMetadata = siteMetadata({
  path: "/kho-tang-tinh-cach",
  title: "Kho tàng xu hướng tài chính cặp đôi",
  description: "Khám phá những xu hướng tài chính và các tổ hợp xu hướng trong một mối quan hệ.",
});

type LibrarySearchParams = { kind?: string; q?: string };

function normalizeSearchValue(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<LibrarySearchParams> }) {
  const query = await searchParams;
  return query.kind || query.q
    ? { ...baseMetadata, alternates: undefined, robots: { index: false, follow: true } }
    : baseMetadata;
}

export default async function TrendLibraryPage({ searchParams }: { searchParams: Promise<LibrarySearchParams> }) {
  const [trends, query] = await Promise.all([getPublishedTrends(), searchParams]);
  const selectedKind = query.kind === "base" || query.kind === "hybrid" ? query.kind : "all";
  const searchQuery = typeof query.q === "string" ? query.q.trim() : "";
  const normalizedQuery = normalizeSearchValue(searchQuery);
  const visibleTrends = trends.filter((trend) => {
    if (selectedKind !== "all" && trend.kind !== selectedKind) return false;
    if (!normalizedQuery) return true;
    const display = trendDisplay(trend);
    return normalizeSearchValue(`${display.title} ${display.english} ${trend.title} ${trend.tagline} ${trend.description} ${trend.key}`).includes(normalizedQuery);
  }).sort((a, b) => figmaTrendOrder.indexOf(a.key) - figmaTrendOrder.indexOf(b.key));

  return (
    <div className="ttt-library-page figma-library-page">
      <section className="ttt-library-hero" id="thu-vien" aria-hidden="true">
        <div className="ttt-library-artwork">
          <Image className="ttt-library-backdrop" src="/figma-assets/design/about-background.png" alt="" width={4724} height={2362} priority quality={95} sizes="(max-width: 767px) 917px, 100vw" />
          <Image className="ttt-library-feature-art" src="/figma-assets/design/e8838.png" alt="" width={3276} height={4096} priority unoptimized sizes="(max-width: 767px) 344px, 41vw" />
          <div className="ttt-library-coin coin-one"><Image className="ttt-library-coin-image" src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} /></div>
          <div className="ttt-library-coin coin-two"><Image className="ttt-library-coin-image" src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} /></div>
          <div className="ttt-library-coin coin-three"><Image className="ttt-library-coin-image" src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} /></div>
          <div className="ttt-library-coin coin-four"><Image className="ttt-library-coin-image" src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} /></div>
          <div className="ttt-library-coin coin-five"><Image className="ttt-library-coin-image" src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} /></div>
          <Image className="ttt-library-star star-one desktop-star" src="/figma-assets/design/5b407.svg" alt="" width={60} height={60} />
          <Image className="ttt-library-star star-two desktop-star" src="/figma-assets/design/b189b.svg" alt="" width={60} height={60} />
          <Image className="ttt-library-star star-three desktop-star" src="/figma-assets/design/986f0.svg" alt="" width={60} height={60} />
          <Image className="ttt-library-star star-four desktop-star" src="/figma-assets/design/5a73d.svg" alt="" width={60} height={60} />
          <Image className="ttt-library-star star-one mobile-star" src="/figma-assets/design/fd6fb.svg" alt="" width={24} height={24} />
          <Image className="ttt-library-star star-two mobile-star" src="/figma-assets/design/091db.svg" alt="" width={12} height={12} />
          <Image className="ttt-library-star star-three mobile-star" src="/figma-assets/design/e3a97.svg" alt="" width={13} height={13} />
          <Image className="ttt-library-star star-four mobile-star" src="/figma-assets/design/b682b.svg" alt="" width={28} height={28} />
          <Image className="ttt-library-wave ttt-library-wave-desktop" src="/figma-assets/design/686e2.svg" alt="" width={1595} height={145} />
          <Image className="ttt-library-wave ttt-library-wave-mobile" src="/figma-assets/design/7b5c2.svg" alt="" width={448} height={75} />
        </div>
      </section>
      <section className="ttt-library-intro">
        <div className="ttt-library-heading">
          <h1>Kho tàng 15 xu hướng tài chính<br />giữa cặp đôi</h1>
          <p className="ttt-library-subtitle">Trong tài chính cặp đôi, bạn thuộc hệ nào?</p>
        </div>
        <p>Bước vào một mối quan hệ, cách chúng ta ứng xử với tiền bạc hiếm khi hoàn toàn giống nhau.<br />Có người coi trọng sự an toàn dài hạn, có người muốn trọn vẹn tận hưởng hiện tại; có người đề cao tính minh bạch, có người lại cần không gian riêng tư tài chính. 15 xu hướng dưới đây đại diện cho 15 góc nhìn thường gặp nhất giữa các cặp đôi - không có lựa chọn đúng hay sai, chỉ có những điểm chung và khác biệt cần được làm quen để cùng nhịp bước.<br />Cùng mở từng đồng xu để đọc vị phong cách tài chính của bạn và người ấy!</p>
      </section>
      <a className="ttt-library-scroll-arrow" href="#library-controls" aria-label="Cuộn đến bộ lọc xu hướng">
        <Image className="ttt-down-arrow-icon desktop" src="/figma-assets/design/9986b.svg" alt="" width={38} height={21} />
        <Image className="ttt-down-arrow-icon mobile" src="/figma-assets/design/493c1.svg" alt="" width={28} height={16} />
      </a>
      <section className="ttt-library-controls" id="library-controls" aria-label="Lọc xu hướng">
        <h2>Chọn 1 đồng xu để khám phá</h2>
        <div className="ttt-library-filter-row">
          <form action="/kho-tang-tinh-cach" method="get" role="search" className="ttt-library-search">
            <input type="hidden" name="kind" value={selectedKind} />
            <input type="search" name="q" aria-label="Tìm tính cách" placeholder="Tìm tính cách" defaultValue={searchQuery} />
            <button type="submit" aria-label="Tìm xu hướng">
              <Image src="/figma-assets/design/67dc1.svg" alt="" width={17} height={24} />
            </button>
          </form>
          <TrendFilter selectedKind={selectedKind} searchQuery={searchQuery} />
        </div>
      </section>
      <section className="ttt-library-grid" aria-label="Danh sách xu hướng">
        {visibleTrends.map((trend) => {
          const display = trendDisplay(trend);
          return <Link key={trend.key} href={`/kho-tang-tinh-cach/${trend.slug}`} className="ttt-library-card">
            <TrendCoin trendKey={trend.key} className="figma-library-coin" />
            <h3>{display.title}</h3>
            <p>{display.english}</p>
          </Link>;
        })}
        {visibleTrends.length === 0 ? <p className="ttt-library-empty">Chưa tìm thấy xu hướng phù hợp.</p> : null}
      </section>
    </div>
  );
}

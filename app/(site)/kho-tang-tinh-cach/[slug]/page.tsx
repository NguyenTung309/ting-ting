import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import TrendLibraryPage from "../page";
import { TrendCoin } from "@/components/site/TrendCoin";
import { canonicalUrl, serializeJsonLd, siteMetadata } from "@/lib/seo";
import { getPublishedTrendBySlug, getPublishedTrends } from "@/lib/trends/data";
import { figmaTrendOrder, trendDisplay } from "@/lib/trends/figma-display";
import type { TrendProfile } from "@/lib/trends/types";

type Args = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const trend = await getPublishedTrendBySlug(slug);
  return trend
    ? siteMetadata({
        path: `/kho-tang-tinh-cach/${encodeURIComponent(trend.slug)}`,
        title: trendDisplay(trend).title,
        description: trend.description,
        indexable: trend.status === "published",
      })
    : { title: "Xu hướng không tồn tại", robots: { index: false, follow: true } };
}

function TrendContent({ trend }: { trend: TrendProfile }) {
  const display = trendDisplay(trend);
  return <>
    <TrendCoin trendKey={trend.key} className="figma-trend-detail-coin" />
    <h1>{display.english.toUpperCase()} - “{display.title.toUpperCase()}”</h1>
    <ul className="figma-trend-detail-list">
      <li><strong>Điểm mạnh:</strong> {trend.description} {trend.strengths.join(". ")}.</li>
      <li><strong>Thách thức:</strong> {trend.watchouts.join(". ")}.</li>
      <li><strong>Biểu hiện trong tình yêu:</strong> {trend.harmonyReason}</li>
      <li><strong>Có thể bạn chưa để ý:</strong> {trend.frictionReason}</li>
    </ul>
    <div className="figma-trend-brand-note">
      <strong>Tình Tính Ting Ting nhắn bạn</strong>
      <em>Một gợi ý nhỏ để hai người dễ mở lời hơn</em>
      <p>{trend.conversationPrompts[0] ?? trend.description}</p>
    </div>
  </>;
}

export default async function TrendDetailPage({ params }: Args) {
  const { slug } = await params;
  const [trend, trends] = await Promise.all([getPublishedTrendBySlug(slug), getPublishedTrends()]);
  if (!trend) notFound();
  const display = trendDisplay(trend);
  const related = trends.filter((item) => item.key !== trend.key).sort((a, b) => figmaTrendOrder.indexOf(a.key) - figmaTrendOrder.indexOf(b.key)).slice(0, 4);
  const pageUrl = canonicalUrl(`/kho-tang-tinh-cach/${encodeURIComponent(trend.slug)}`);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Kho xu hướng", item: canonicalUrl("/kho-tang-tinh-cach") },
      { "@type": "ListItem", position: 3, name: display.title, item: pageUrl },
    ],
  };

  return <div className="figma-trend-detail-page">
    <div className="figma-trend-desktop-backdrop" aria-hidden="true">
      <TrendLibraryPage searchParams={Promise.resolve({})} />
    </div>
    <div className="figma-trend-overlay">
      <article className="figma-trend-dialog" aria-label={display.title}>
        <Link className="figma-trend-dialog-close" href="/kho-tang-tinh-cach#library-controls" aria-label="Đóng chi tiết xu hướng">×</Link>
        <TrendContent trend={trend} />
      </article>
    </div>
    <div className="figma-trend-mobile-page">
      <div className="figma-trend-mobile-hero" aria-hidden="true"><Image src="/figma-assets/design/e8838.png" alt="" fill sizes="100vw" unoptimized /></div>
      <h2>Kho tàng 15 xu hướng tài chính<br />giữa cặp đôi</h2>
      <p className="figma-trend-mobile-subtitle">Trong tài chính cặp đôi, bạn thuộc hệ nào?</p>
      <article className="figma-trend-mobile-content"><TrendContent trend={trend} /></article>
      <section className="figma-trend-related">
        <h2>Một số xu hướng tài chính khác</h2>
        <div>{related.map((item) => {
          const info = trendDisplay(item);
          return <Link key={item.key} href={`/kho-tang-tinh-cach/${item.slug}`}>
            <TrendCoin trendKey={item.key} />
            <strong>{info.english}</strong><span>{info.title}</span>
          </Link>;
        })}</div>
        <Link className="figma-trend-related-all" href="/kho-tang-tinh-cach#library-controls">Xem tất cả 15 xu hướng tài chính</Link>
      </section>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
  </div>;
}

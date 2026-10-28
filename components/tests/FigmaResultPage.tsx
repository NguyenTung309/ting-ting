import Image from "next/image";
import Link from "next/link";
import { TrendCoin } from "@/components/site/TrendCoin";

import { ResultLookupActions } from "./ResultLookupActions";
import { roundFinancePercentagesToOneDecimal } from "@/lib/tests/finance-display";
import { trendDisplay } from "@/lib/trends/figma-display";
import { getFallbackTrend } from "@/lib/trends/catalog";
import type { PublicTestResult } from "@/lib/trends/types";

type FeaturedTrendResult = Pick<PublicTestResult, "personalityCode" | "resultKey" | "title" | "tagline" | "summary">;

const dimensions = [
  { key: "security", label: "Saver" },
  { key: "experience", label: "Spender" },
  { key: "avoidance", label: "Avoider" },
  { key: "control", label: "Controller" },
  { key: "independence", label: "Independent" },
];

function point(index: number, score: number, radius = 118) {
  const angle = -Math.PI / 2 + index * Math.PI * 2 / dimensions.length;
  const distance = radius * score;
  return [160 + Math.cos(angle) * distance, 160 + Math.sin(angle) * distance] as const;
}

function ResultStar({ scores, allowZero }: { scores: Record<string, number>; allowZero: boolean }) {
  const outline = dimensions.map((_, index) => point(index, 1).join(",")).join(" ");
  const minimum = allowZero ? 0 : 0.08;
  const values = dimensions.map((dimension, index) => point(index, Math.max(minimum, Math.min(100, scores[dimension.key] ?? 0) / 100)).join(",")).join(" ");
  return <svg className="figma-result-star" viewBox="0 0 320 320" role="img" aria-label="Biểu đồ năm xu hướng tài chính">
    <defs><radialGradient id="figma-result-star-gradient"><stop stopColor="#f85174" stopOpacity=".8" /><stop offset="1" stopColor="#f85174" stopOpacity=".08" /></radialGradient></defs>
    <polygon points={outline} fill="none" stroke="#ff94aa" strokeWidth="1.4" />
    <polygon points={values} fill="url(#figma-result-star-gradient)" stroke="#f85174" strokeWidth="2" />
    {dimensions.map((dimension, index) => {
      const [x, y] = point(index, 1.25);
      const [dotX, dotY] = point(index, Math.max(minimum, Math.min(100, scores[dimension.key] ?? 0) / 100));
      return <g key={dimension.key}>
        <circle cx={dotX} cy={dotY} r="4" fill="#fff9f0" stroke="#f85174" strokeWidth="2" />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#f85174" fontSize="14">{dimension.label}</text>
      </g>;
    })}
  </svg>;
}

export function ResultFeaturedTrend({ result }: { result: FeaturedTrendResult }) {
  const trend = getFallbackTrend(result.personalityCode ?? result.resultKey);
  const display = trend ? trendDisplay(trend) : { title: result.title, english: result.tagline };

  return <section className="figma-result-hero" data-testid="result-hero">
    <div className="figma-result-hero-copy">
      <span className="figma-result-eyebrow">Xu hướng nổi bật</span>
      <h1>{display.title}</h1>
      <strong>{display.english}</strong>
      <p>{result.summary}</p>
    </div>
    <TrendCoin trendKey={trend?.key ?? result.resultKey} className="figma-result-hero-coin" />
  </section>;
}

export function FigmaResultPage({ result }: { result: PublicTestResult }) {
  const scores = result.scores ?? result.adjustedScores ?? {};
  const usesV4Scores = result.formulaVersion === 4;
  const displayScores = usesV4Scores ? roundFinancePercentagesToOneDecimal(scores) : scores;
  const insights = [
    { title: "Điểm mạnh", text: result.strengths.join(". ") || result.summary, tone: "pink" },
    { title: "Thách thức", text: result.watchouts.join(". ") || result.summary, tone: "mint" },
    { title: "Biểu hiện trong tình yêu", text: result.suggestions.join(". ") || result.summary, tone: "yellow" },
    { title: "Có thể bạn chưa để ý", text: result.conversationPrompt || result.summary, tone: "blue" },
  ];

  return <div className="figma-result-page" data-testid="result-details">
    <ResultFeaturedTrend result={result} />

    <section className="figma-result-analysis" aria-labelledby="figma-result-analysis-title">
      <p>Phân tích kết quả</p>
      <h2 id="figma-result-analysis-title">Hiểu thêm về cách bạn “Tính” khi yêu</h2>
      <div className="figma-result-overview">
        <ResultStar scores={displayScores} allowZero={usesV4Scores} />
        <div className="figma-result-breakdown">
          <h3>Chỉ số xu hướng</h3>
          {dimensions.map((dimension) => <div className="figma-result-score" key={dimension.key}>
            <span>{dimension.label}</span><div><i style={{ width: `${Math.min(100, Math.max(0, displayScores[dimension.key] ?? 0))}%` }} /></div>
            <span>{usesV4Scores ? (displayScores[dimension.key] ?? 0).toFixed(1) : Math.round(displayScores[dimension.key] ?? 0)}%</span>
          </div>)}
          <div className="figma-result-actions"><ResultLookupActions code={result.tttCode} /></div>
        </div>
      </div>
      <div className="figma-result-insights">
        {insights.map((item) => <article key={item.title} className={`figma-result-insight ${item.tone}`}>
          <h3>{item.title}</h3><p>{item.text}</p>
        </article>)}
      </div>
      <aside className="figma-result-brand">
        <Image src="/figma-assets/design/9a3e0.png" alt="" width={150} height={150} unoptimized />
        <div><h3>Tình Tính Ting Ting nhắn bạn</h3><em>Một gợi ý nhỏ để hai người dễ mở lời hơn</em><p>{result.conversationPrompt}</p></div>
      </aside>
    </section>
    <section className="figma-result-next">
      <div className="figma-result-next-inner">
        <article><h2>Khám phá đủ 15 tính cách</h2><p>15 xu hướng dưới đây đại diện cho 15 góc nhìn thường gặp nhất giữa các cặp đôi. Cùng mở từng đồng xu để đọc vị phong cách tài chính của bạn và người ấy!</p><Link href="/kho-tang-tinh-cach">Khám phá 15 xu hướng →</Link></article>
        <article><span>Coming soon</span><h2>Ghép Ting sắp xuất hiện!</h2><p>Để biết thêm về điều gì kết nối hai bạn khi nói chuyện tiền bạc, hãy cùng chờ đón Ghép Ting nhé!</p><Link href="/tuong-thich-doi">Cùng chờ Ghép Ting nha!</Link></article>
      </div>
    </section>
  </div>;
}

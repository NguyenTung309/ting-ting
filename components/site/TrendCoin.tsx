import Image from "next/image";

import { trendCoinAssets } from "@/lib/trends/figma-display";

export function TrendCoin({ trendKey, className = "" }: { trendKey: string; className?: string }) {
  const parts = trendKey.split("-").slice(0, 2);
  if (parts.length === 1) {
    const file = trendCoinAssets[parts[0]] ?? trendCoinAssets.security;
    return <span className={`figma-trend-coin ${className}`} aria-hidden="true">
      <Image src={`/figma-assets/design/${file}`} alt="" width={2362} height={2362} sizes="(max-width: 767px) 200px, 400px" />
    </span>;
  }
  return <span className={`figma-trend-coin is-hybrid ${className}`} aria-hidden="true">
    {parts.map((part, index) => <span key={part} className={index === 0 ? "figma-trend-half first" : "figma-trend-half second"}>
      <Image src={`/figma-assets/design/${trendCoinAssets[part] ?? trendCoinAssets.security}`} alt="" width={2362} height={2362} sizes="(max-width: 767px) 200px, 400px" />
    </span>)}
  </span>;
}

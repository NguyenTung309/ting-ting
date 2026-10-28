import type { Metadata } from "next";
import Image from "next/image";
import { siteMetadata } from "@/lib/seo";

export const metadata: Metadata = siteMetadata({
  path: "/card",
  title: "Card game",
  description: "Card game của Tình Tính Ting Ting.",
  indexable: false,
});

export default function CardPage() {
  return <section className="figma-card-page" aria-label="Card game sắp ra mắt">
    <div className="figma-card-artboard" aria-hidden="true">
      <div className="figma-card-background"><Image src="/figma-assets/design/abf45.png" alt="" fill priority sizes="100vw" /></div>
      <div className="figma-card-deck"><Image src="/figma-assets/design/e8838.png" alt="" fill sizes="280px" unoptimized /></div>
      <div className="figma-card-back card-a" /><div className="figma-card-back card-b" />
      <div className="figma-card-back card-c" /><div className="figma-card-back card-d" />
      <div className="figma-card-back card-e" /><div className="figma-card-back card-f" />
      <span className="figma-card-sos">SOS</span>
    </div>
  </section>;
}

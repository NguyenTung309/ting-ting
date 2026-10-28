import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ScrollScenes } from "@/components/site/ScrollScenes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SITE_URL } from "@/lib/seo";
import "../globals.css";
import "../figma-31.css";
import "../test-entry-figma.css";
import "../home.css";

const cdaIndependenceDeck = localFont({
  src: [
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-Light.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-Medium.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-Black.otf", weight: "900", style: "normal" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-Italic.otf", weight: "400", style: "italic" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-SemiBoldItalic.otf", weight: "600", style: "italic" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-ExtraBoldItalic.otf", weight: "800", style: "italic" },
    { path: "../../public/fonts/cda-independence-deck/CDAIndependenceDeck-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-cda-independence-deck",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Tình Tính Ting Ting",
    template: "%s · Tình Tính Ting Ting",
  },
  description: "Một không gian nhẹ nhàng để khám phá xu hướng tài chính, sự tương thích và những câu chuyện đáng nhớ.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Tình Tính Ting Ting",
    title: "Tình Tính Ting Ting",
    description: "Khám phá xu hướng tài chính, tương thích đôi và những góc chia sẻ gần gũi.",
  },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="vi" data-scroll-behavior="smooth" className={`${cdaIndependenceDeck.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen flex-col">
          <AuthProvider>
            <SiteHeader />
            <ScrollScenes />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

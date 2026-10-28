import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../globals.css";

export const metadata: Metadata = {
  title: "Quản trị · Tình Tính Ting Ting",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#f4f7fe] text-[#1f2937] antialiased">{children}</body>
    </html>
  );
}

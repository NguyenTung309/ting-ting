"use client";

import { useState } from "react";

export function ResultLookupActions({ code }: { code: string }) {
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  async function copyLink() {
    await navigator.clipboard?.writeText(window.location.href);
    setMessage("Đã copy link");
    window.setTimeout(() => setMessage(""), 1800);
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Kết quả ${code} · Tình Tính Ting Ting`, url: window.location.href });
      } else {
        await copyLink();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Chưa thể chia sẻ lúc này");
    }
  }

  async function downloadCard() {
    setDownloading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/results/${encodeURIComponent(code)}/card`);
      if (!response.ok) throw new Error("Không thể tạo ảnh kết quả.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${code.toUpperCase()}-ket-qua.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Đã tải ảnh kết quả");
    } catch {
      setMessage("Chưa thể tải ảnh lúc này");
    } finally {
      setDownloading(false);
    }
  }

  return <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => void share()} className="min-h-11 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)]">{message || "Chia sẻ kết quả"}</button><button type="button" onClick={() => void downloadCard()} disabled={downloading} className="min-h-11 rounded-full border border-[#c99689] px-5 py-3 text-sm font-bold text-[var(--accent)] hover:bg-[#fff0ea] disabled:opacity-60">{downloading ? "Đang tạo ảnh…" : "Tải ảnh kết quả"}</button><button type="button" onClick={() => void copyLink()} className="min-h-11 rounded-full border border-[#c99689] px-5 py-3 text-sm font-bold text-[var(--accent)] hover:bg-[#fff0ea]">Copy link</button></div>;
}

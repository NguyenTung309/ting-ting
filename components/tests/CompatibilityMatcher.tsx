"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { TrendRadar } from "@/components/tests/TrendRadar";
import type { CompatibilityResult, PublicTestResult } from "@/lib/trends/types";

function ResultSection({ result, onReset }: { result: CompatibilityResult; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareText = `Tình Tính Ting Ting: ${result.score}% tương thích giữa ${result.personA.tttCode} và ${result.personB.tttCode}`;

  async function shareResult() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Kết quả tương thích · Tình Tính Ting Ting", text: shareText, url: window.location.href });
      } else {
        await navigator.clipboard?.writeText(`${shareText} ${window.location.href}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCopied(false);
    }
  }

  return (
    <section className="space-y-6" aria-live="polite">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid min-h-[320px] place-items-center rounded-[2rem] border border-[var(--line)] bg-[#fffaf0] p-8 text-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Hai bạn gặp nhau ở</p><p className="mt-4 font-mono text-7xl font-bold tracking-[-0.1em] text-[var(--accent)]">{result.score}<span className="text-2xl">%</span></p><p className="mx-auto mt-5 max-w-xs text-sm leading-6 text-[var(--muted)]">Một điểm bắt đầu để nhìn thấy điều hai người đang cùng giữ và những điều cần nói rõ hơn.</p></div>
        </div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Xu hướng của hai người</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#fff5e8] p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Mã thứ nhất</p><p className="mt-2 font-bold text-[var(--ink)]">{result.personA.title}</p><p className="mt-1 font-mono text-xs text-[var(--accent)]">{result.personA.tttCode}</p></div><div className="rounded-2xl bg-[#edf3df] p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Mã thứ hai</p><p className="mt-2 font-bold text-[var(--ink)]">{result.personB.title}</p><p className="mt-1 font-mono text-xs text-[#658055]">{result.personB.tttCode}</p></div></div><p className="mt-6 leading-7 text-[var(--muted)]">{result.score >= 75 ? "Hai bạn có nhiều điểm chạm tự nhiên để cùng bắt đầu." : result.score >= 50 ? "Khác biệt của hai bạn đủ thú vị để trở thành một cuộc trò chuyện tốt." : "Hai bạn có nhiều điều để khám phá; hãy bắt đầu từ một câu hỏi nhỏ và thật."}</p></div>
      </div>

      <TrendRadar scoresA={result.personA.scores ?? {}} scoresB={result.personB.scores ?? {}} label="Biểu đồ so sánh 5 xu hướng của hai người" />

      <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-[2rem] border border-[#bfd1a7] bg-[#f2f7e8] p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#658055]">Dễ cùng tần số</p><p className="mt-2 text-sm leading-6 text-[#647259]">Ba nhóm có chênh lệch nhỏ nhất giữa hai radar.</p><div className="mt-5 space-y-3">{result.closeDimensions.map((dimension) => <div key={dimension.key} className="rounded-2xl bg-white/75 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-[var(--ink)]">{dimension.label}</p><span className="font-mono text-xs text-[#658055]">{100 - dimension.difference}% gặp nhau</span></div><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{dimension.trend?.harmonyReason || "Hai người đang có một điểm nhìn khá gần nhau ở đây."}</p></div>)}</div></div><div className="rounded-[2rem] border border-[#e5c9b9] bg-[#fff7ef] p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Dễ lệch nhịp</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Hai nhóm có chênh lệch lớn nhất, để mình cùng nói rõ hơn.</p><div className="mt-5 space-y-3">{result.distantDimensions.map((dimension) => <div key={dimension.key} className="rounded-2xl bg-white/75 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-[var(--ink)]">{dimension.label}</p><span className="font-mono text-xs text-[var(--accent)]">{100 - dimension.difference}% gặp nhau</span></div><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{dimension.trend?.frictionReason || "Đây là chỗ hai người nên nói rõ nhu cầu của mình hơn."}</p></div>)}</div></div></div>

      <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Gợi ý dung hòa</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{result.suggestions.map((suggestion) => <p key={suggestion} className="rounded-2xl bg-[#fffaf1] px-4 py-3 text-sm leading-6 text-[var(--ink)]">{suggestion}</p>)}</div><p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Câu hỏi mở lời</p><div className="mt-4 space-y-3">{result.prompts.map((prompt) => <p key={prompt} className="rounded-2xl border border-dashed border-[#d9b7a8] px-4 py-3 text-sm leading-6 text-[var(--muted)]">“{prompt}”</p>)}</div><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => void shareResult()} className="min-h-11 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)]">{copied ? "Đã copy link" : "Chia sẻ kết quả"}</button><Link href="/kho-tang-tinh-cach" className="min-h-11 rounded-full border border-[#c99689] px-5 py-3 text-sm font-bold text-[var(--accent)] hover:bg-[#fff0ea]">Khám phá xu hướng</Link><button type="button" onClick={onReset} className="min-h-11 rounded-full px-3 py-3 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]">So sánh lại</button></div></div>
    </section>
  );
}

export function CompatibilityMatcher() {
  const [myCode, setMyCode] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [myResult, setMyResult] = useState<PublicTestResult | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedCode = window.localStorage.getItem("ttt-last-code") || "";
    const timer = window.setTimeout(() => {
      setMyCode(storedCode);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!myCode) return;
    let active = true;
    void fetch(`/api/results/${encodeURIComponent(myCode)}`).then(async (response) => response.ok ? response.json() as Promise<PublicTestResult> : null).then((data) => {
      if (active) setMyResult(data);
    });
    return () => { active = false; };
  }, [myCode]);

  async function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch("/api/results/compare", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ codeA: myCode, codeB: partnerCode }) });
      const data = (await response.json()) as CompatibilityResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Không thể tính độ tương thích lúc này.");
      setResult(data);
    } catch (compareError) {
      setError(compareError instanceof Error ? compareError.message : "Có lỗi xảy ra. Bạn thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  if (result) return <ResultSection result={result} onReset={() => setResult(null)} />;

  if (!ready) {
    return <div className="rounded-[2rem] border border-[var(--line)] bg-[#fffdf7] p-6 text-sm text-[var(--muted)] shadow-[0_18px_50px_rgba(126,60,53,0.08)] sm:p-9" aria-live="polite">Đang tải thông tin kết quả gần nhất…</div>;
  }

  return <form onSubmit={compare} className="rounded-[2rem] border border-[var(--line)] bg-[#fffdf7] p-6 shadow-[0_18px_50px_rgba(126,60,53,0.08)] sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">So sánh với nửa kia</p><h2 className="mt-4 text-3xl font-bold tracking-[-0.06em] text-[var(--ink)]">Hai mã TTT, một cuộc trò chuyện mới.</h2><p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Mỗi người làm bài Test riêng, sau đó nhập mã của nhau để nhìn thấy những điểm cùng tần số và những nơi cần lắng nghe kỹ hơn.</p>{myResult ? <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#bfd1a7] bg-[#f2f7e8] px-4 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#658055]">Kết quả gần nhất của bạn</p><p className="mt-1 font-bold text-[var(--ink)]">{myResult.title}</p><p className="mt-1 font-mono text-xs text-[#658055]">{myResult.tttCode}</p></div><Link href={`/ket-qua/${myResult.tttCode}`} className="text-sm font-bold text-[#658055] underline underline-offset-4">Xem kết quả</Link></div> : <div className="mt-6 rounded-2xl bg-[#fff5e8] px-4 py-4 text-sm leading-6 text-[#765648]">Bạn chưa có mã TTT trên thiết bị này. <Link href="/test-xu-huong-tai-chinh" className="font-bold text-[var(--accent)] underline underline-offset-4">Làm Test trước</Link>, hoặc nhập mã của bạn bên dưới.</div>}<div className="mt-8 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-[var(--ink)]">Mã TTT của bạn<input value={myCode} onChange={(event) => setMyCode(event.target.value.toUpperCase())} placeholder="TTT-A72K9" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 font-mono outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[#c85a5020]" /></label><label className="text-sm font-bold text-[var(--ink)]">Mã TTT của người ấy<input value={partnerCode} onChange={(event) => setPartnerCode(event.target.value.toUpperCase())} placeholder="TTT-B84LM" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 font-mono outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[#c85a5020]" /></label></div>{error ? <p className="mt-4 rounded-xl bg-[#fff0ea] px-4 py-3 text-sm text-[#a33d36]" role="alert">{error}</p> : null}{loading ? <div className="mt-6 rounded-2xl bg-[#fffaf1] px-4 py-4 text-sm text-[var(--muted)]" aria-live="polite">Đang tính độ tương thích…</div> : null}<div className="mt-7 flex flex-wrap items-center gap-4"><button type="submit" disabled={loading} className="min-h-12 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60">{loading ? "Đang tính…" : "Khám phá tương thích →"}</button><Link href="/test-xu-huong-tai-chinh" className="text-sm font-bold text-[var(--accent)] underline decoration-[#e1afa3] underline-offset-4">Chưa có mã? Làm Test trước</Link></div></form>;
}

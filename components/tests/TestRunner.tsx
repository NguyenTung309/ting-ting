"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { ResultHero, ResultJourneyCards } from "@/components/tests/ResultJourney";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { EvaluationResponse, TestDefinition } from "@/lib/tests/types";

const optionLetters = ["A", "B", "C", "D", "E", "F"];

const desktopEntryCoins = [
  { name: "independence-large", image: "05e32.png" },
  { name: "independence-left", image: "05e32.png" },
  { name: "independence-top", image: "05e32.png" },
  { name: "saver-large", image: "c6be4.png" },
  { name: "saver-middle", image: "c6be4.png" },
  { name: "control-middle", image: "9b284.png" },
  { name: "spender-right", image: "e5666.png" },
  { name: "spender-top", image: "e5666.png" },
  { name: "spender-left", image: "e5666.png" },
] as const;

function AnswerGroup({
  question,
  value,
  onChange,
  label,
}: {
  question: TestDefinition["questions"][number];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div>
      {label ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{label}</p> : null}
      <div className="ttt-answer-list" role="radiogroup" aria-label={label || "Chọn một đáp án"}>
        {question.options.map((option, index) => {
          const selected = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.key)}
              className={`ttt-answer-option${selected ? " is-selected" : ""}`}
            >
              <span>{optionLetters[index]}.</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RadarChart({ test, scores }: { test: TestDefinition; scores: Record<string, number> }) {
  const dimensions = test.dimensions.slice(0, 6);
  const center = 180;
  const radius = 116;

  function point(index: number, value: number, scale = radius) {
    const angle = -Math.PI / 2 + (index / dimensions.length) * Math.PI * 2;
    const distance = scale * value;
    return [center + Math.cos(angle) * distance, center + Math.sin(angle) * distance];
  }

  const polygon = (value: number) => dimensions.map((_, index) => point(index, value).join(",")).join(" ");
  const scorePolygon = dimensions.map((dimension, index) => point(index, Math.max(0.08, (scores[dimension.key] ?? 0) / 100)).join(",")).join(" ");

  return (
    <div className="relative rounded-[2rem] border border-[var(--line)] bg-[#fffaf0] p-4 sm:p-7">
      <svg viewBox="0 0 360 360" className="mx-auto block w-full max-w-[390px]" role="img" aria-label="Biểu đồ xu hướng của bạn">
        {[0.25, 0.5, 0.75, 1].map((level) => <polygon key={level} points={polygon(level)} fill="none" stroke="#e5cdb7" strokeWidth="1" />)}
        {dimensions.map((dimension, index) => {
          const [x, y] = point(index, 1);
          const [labelX, labelY] = point(index, 1.18);
          return (
            <g key={dimension.key}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="#ecdccc" strokeWidth="1" />
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="#806e62" fontSize="10" fontWeight="600">{dimension.label.replace("Người ", "")}</text>
            </g>
          );
        })}
        <polygon points={scorePolygon} fill="#c85a50" fillOpacity="0.16" stroke="#c85a50" strokeWidth="2.5" />
        {dimensions.map((dimension, index) => {
          const [x, y] = point(index, Math.max(0.08, (scores[dimension.key] ?? 0) / 100));
          return <circle key={dimension.key} cx={x} cy={y} r="4" fill="#c85a50" stroke="#fffaf0" strokeWidth="2" />;
        })}
        <circle cx={center} cy={center} r="4" fill="#c85a50" />
      </svg>
      <p className="mt-1 text-center text-xs leading-5 text-[var(--muted)]">Mỗi trục là một xu hướng được chuẩn hóa theo số lần xuất hiện trong bài test.</p>
    </div>
  );
}

function CompatibilityScore({ score }: { score: number }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-[2rem] border border-[var(--line)] bg-[#fffaf0] p-8 text-center">
      <div>
        <div className="relative mx-auto grid size-52 place-items-center rounded-full border-[14px] border-[#f5d9c7] before:absolute before:inset-[-14px] before:rounded-full before:border-[14px] before:border-transparent before:border-t-[var(--accent)] before:border-r-[var(--accent)] before:rotate-[25deg]">
          <div>
            <p className="font-mono text-6xl font-bold tracking-[-0.08em] text-[var(--accent)]">{score}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">trên 100</p>
          </div>
        </div>
        <p className="mx-auto mt-7 max-w-xs text-sm leading-6 text-[var(--muted)]">Điểm này cho thấy cách hai bạn trả lời gặp nhau trong những tình huống của bài test.</p>
      </div>
    </div>
  );
}

function ResultView({
  test,
  result,
  settings,
  onDownload,
  onShare,
  onReset,
  sharing,
}: {
  test: TestDefinition;
  result: EvaluationResponse;
  settings: PublicSiteSettings;
  onDownload: () => void;
  onShare: () => void;
  onReset: () => void;
  sharing: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const trend = result.trend;

  async function copyCode() {
    if (!result.tttCode) return;
    await navigator.clipboard?.writeText(result.tttCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="space-y-6" aria-live="polite">
      <ResultHero
        title={trend?.title || result.title}
        icon={trend?.icon || "✦"}
        characterAsset={result.imageChoice === "SUN" ? trend?.sunAsset : trend?.moonAsset}
        imageChoice={result.imageChoice}
      />
      <div data-testid="result-details" className="space-y-6 pt-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
        {result.scores ? <RadarChart test={test} scores={result.scores} /> : <CompatibilityScore score={result.score ?? 0} />}
        <div className="flex flex-col rounded-[2rem] border border-[var(--line)] bg-white p-6 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Kết quả của bạn</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.06em] text-[var(--ink)] sm:text-4xl">{trend?.title || result.title}</h2>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff0ea] text-2xl text-[var(--accent)]" aria-hidden="true">{trend?.icon || "✦"}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-[var(--accent)]">{trend?.tagline || result.profile?.subtitle}</p>
          {result.characterId ? <p className="mt-3 inline-flex w-fit rounded-full bg-[#f4edf7] px-3 py-2 font-mono text-xs font-bold tracking-[0.12em] text-[#77658a]">{result.characterId}</p> : null}
          <p className="mt-5 text-[1.02rem] leading-7 text-[var(--muted)]">{trend?.description || result.summary}</p>
          {typeof result.score === "number" ? <p className="mt-5 inline-flex w-fit rounded-full bg-[#fff0ea] px-3 py-2 font-mono text-sm font-bold text-[var(--accent)]">Điểm tương thích: {result.score}/100</p> : null}
          <div className="mt-6 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
            {(trend?.strengths || result.profile?.strengths)?.length ? <div><p className="text-sm font-bold text-[var(--ink)]">Điểm mạnh</p><ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted)]">{(trend?.strengths || result.profile?.strengths || []).map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
            {(trend?.watchouts || result.profile?.watchouts)?.length ? <div><p className="text-sm font-bold text-[var(--ink)]">Thử để ý</p><ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted)]">{(trend?.watchouts || result.profile?.watchouts || []).map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
          </div>
          {result.adjustedScores ? <div className="mt-5 rounded-2xl bg-[#f7f2ec] px-4 py-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Điểm điều chỉnh</p><div className="mt-3 grid grid-cols-5 gap-2 text-center">{Object.entries(result.adjustedScores).map(([key, value]) => <div key={key}><p className="font-mono text-sm font-bold text-[var(--ink)]">{key}</p><p className="mt-1 text-xs text-[var(--muted)]">{value.toFixed(3)}</p></div>)}</div></div> : null}
          <div className="mt-auto pt-7">
            {result.tttCode ? <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[#d9b7a8] bg-[#fffaf1] px-4 py-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Mã TTT của bạn</p><Link href={`/ket-qua/${result.tttCode}`} className="mt-1 block font-mono text-lg font-bold tracking-[0.14em] text-[var(--accent)] hover:underline">{result.tttCode}</Link></div><button type="button" onClick={() => void copyCode()} className="min-h-10 rounded-full border border-[#c99689] px-4 py-2 text-xs font-bold text-[var(--accent)] hover:bg-[#fff0ea]">{copied ? "Đã copy" : "Copy mã"}</button></div> : null}
            <div className="rounded-2xl bg-[#fff5e8] px-4 py-4 text-sm leading-6 text-[#765648]">
              <span className="font-bold">Gợi ý mở lời: </span>{result.profile?.conversationPrompt || "Bạn muốn chia sẻ điều gì đầu tiên từ kết quả này?"}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={onDownload} disabled={sharing} className="min-h-11 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9433d] active:translate-y-px disabled:opacity-60">{sharing ? "Đang chuẩn bị…" : "Tải ảnh kết quả"}</button>
              <button type="button" onClick={onShare} disabled={sharing} className="min-h-11 rounded-full border border-[#c99689] px-5 py-3 text-sm font-bold text-[var(--accent)] transition hover:bg-[#fff0ea] active:translate-y-px disabled:opacity-60">Chia sẻ</button>
              <button type="button" onClick={onReset} className="min-h-11 rounded-full px-3 py-3 text-sm font-bold text-[var(--muted)] transition hover:text-[var(--ink)]">Làm lại</button>
            </div>
          </div>
        </div>
      </div>
      {result.profile?.suggestions.length ? (
        <div className="rounded-[2rem] border border-[var(--line)] bg-[#f2f6e8] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#658055]">Một bước nhỏ sau bài test</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.profile.suggestions.map((suggestion) => <p key={suggestion} className="rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-[var(--ink)]">{suggestion}</p>)}
          </div>
        </div>
      ) : null}
      <ResultJourneyCards settings={settings} />
      </div>
    </section>
  );
}

export function TestRunner({ test, settings }: { test: TestDefinition; settings: PublicSiteSettings }) {
  const [personA, setPersonA] = useState<Record<string, string>>({});
  const [personB, setPersonB] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [character, setCharacter] = useState<"female" | "male">("female");
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!result) return;
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-testid="result-hero"]')?.scrollIntoView({ behavior: "instant", block: "start" }));
  }, [result]);

  useEffect(() => {
    if (started) window.scrollTo({ top: 0, behavior: "instant" });
  }, [current, started]);

  useEffect(() => {
    if (!loading || test.kind !== "finance") return;
    const timer = window.setInterval(() => setLoadingStage((stage) => Math.min(stage + 1, 3)), 700);
    return () => window.clearInterval(timer);
  }, [loading, test.kind]);

  const question = test.questions[current];
  const selectedForCurrent = test.kind === "finance" ? Boolean(personA[question.key]) : Boolean(personA[question.key] && personB[question.key]);

  function requestBody() {
    return test.kind === "finance"
      ? { respondentName: respondentName.trim(), imageChoice: character === "male" ? "SUN" : "MOON", answers: { q0: character === "male" ? "SUN" : "MOON", ...personA } }
      : { personAName: respondentName.trim(), personBName: partnerName.trim(), personA, personB };
  }

  function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setError(null);
    if (test.kind === "finance") {
      if (!respondentName.trim()) setRespondentName("Bạn");
      setStarted(true);
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (respondentName.trim().length < 2 || partnerName.trim().length < 2) {
      setError("Hai bạn nhập tên để bắt đầu nhé.");
      return;
    }
    setStarted(true);
  }

  async function evaluate() {
    setError(null);
    if (!selectedForCurrent) {
      setError(test.kind === "finance" ? "Bạn chọn một đáp án trước khi tiếp tục nhé." : "Cả hai cùng chọn một đáp án trước khi tiếp tục nhé.");
      return;
    }
    setLoadingStage(0);
    setLoading(true);
    const loadingStartedAt = Date.now();
    try {
      const response = await fetch(`/api/tests/${test.slug}/evaluate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(requestBody()) });
      const data = (await response.json()) as { error?: string; tttCode?: string; resultUrl?: string };
      if (!response.ok) throw new Error(data.error || "Không thể tính kết quả lúc này.");
      if (!data.tttCode || !data.resultUrl) throw new Error("Bài làm chưa được lưu thành công. Bạn thử gửi lại nhé.");
      window.localStorage.setItem("ttt-last-code", data.tttCode);
      if (test.kind === "finance") await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, 2800 - (Date.now() - loadingStartedAt))));
      window.location.assign(data.resultUrl);
    } catch (evaluationError) {
      setError(evaluationError instanceof Error ? evaluationError.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedForCurrent) {
      setError(test.kind === "finance" ? "Bạn chọn một đáp án trước khi tiếp tục nhé." : "Cả hai cùng chọn một đáp án trước khi tiếp tục nhé.");
      return;
    }
    if (current === test.questions.length - 1) void evaluate();
    else {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      setError(null);
      setCurrent((value) => value + 1);
    }
  }

  async function getImage() {
    const response = await fetch(`/api/tests/${test.slug}/result.png`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(requestBody()) });
    if (!response.ok) throw new Error("Không thể tạo ảnh kết quả.");
    return response.blob();
  }

  async function downloadResult() {
    setSharing(true);
    try {
      const blob = await getImage();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${test.slug}-ket-qua.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Không thể tải ảnh kết quả. Bạn thử lại sau nhé.");
    } finally {
      setSharing(false);
    }
  }

  async function shareResult() {
    setSharing(true);
    try {
      const blob = await getImage();
      const file = new File([blob], `${test.slug}-ket-qua.png`, { type: "image/png" });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) await navigator.share({ title: result?.title, text: result?.summary, files: [file] });
      else await downloadResult();
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      setError("Thiết bị này chưa hỗ trợ chia sẻ ảnh.");
    } finally {
      setSharing(false);
    }
  }

  function reset() {
    setPersonA({});
    setPersonB({});
    setRespondentName("");
    setPartnerName("");
    setCharacter("female");
    setCurrent(0);
    setStarted(false);
    setResult(null);
    setError(null);
  }

  if (result) return <ResultView test={test} result={result} settings={settings} onDownload={() => void downloadResult()} onShare={() => void shareResult()} onReset={reset} sharing={sharing} />;

  if (loading) {
    if (test.kind === "finance") {
      const stages = [
        "Đang kết nối những lựa chọn của bạn...",
        "Xem những xu hướng nào đang nổi bật hơn một chút...",
        "Đang hoàn thiện hồ sơ xu hướng của bạn...",
        "Gần xong rồi, kết quả của bạn sắp xuất hiện...",
      ];
      return <section className="figma-test-loading" aria-live="polite" aria-label="Đang phân tích bài test">
        <Image src="/figma-assets/design/defdf.svg" alt="" width={340} height={340} priority className="figma-test-loading-star" />
        <h1>Đang đọc cách bạn “Tính” khi yêu...</h1>
        <p>{stages[loadingStage]}</p>
      </section>;
    }
    return <section className="rounded-[2rem] border border-[var(--line)] bg-[#fffdf7] p-8 text-center shadow-[0_18px_50px_rgba(126,60,53,0.08)] sm:p-12" aria-live="polite"><div className="mx-auto grid size-20 place-items-center rounded-full bg-[#fff0ea] text-4xl text-[var(--accent)] motion-safe:animate-pulse">✦</div><p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Đang phân tích bài test</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--ink)]">Nhìn lại những điều bạn vừa chọn</h2><p className="mx-auto mt-4 max-w-md leading-7 text-[var(--muted)]">Một chút nữa thôi, kết quả đang được sắp xếp thành một góc nhìn dễ hiểu hơn.</p><div className="mx-auto mt-7 h-2 max-w-sm overflow-hidden rounded-full bg-[#f2e4da]"><div className="h-full w-2/3 rounded-full bg-[var(--accent)] motion-safe:animate-pulse" /></div></section>;
  }

  if (!started) {
    if (test.kind === "finance") {
      return (
        <section className="ttt-test-entry" aria-labelledby="finance-test-title">
          <div className="ttt-test-entry-art" aria-hidden="true">
            <div className="figma-test-desktop-art">
              {desktopEntryCoins.map((coin) => (
                <span className={`figma-test-desktop-coin ${coin.name}`} key={coin.name}>
                  <span className="figma-test-desktop-coin-face">
                    <Image src={`/figma-assets/design/${coin.image}`} alt="" width={2362} height={2362} sizes="(max-width: 1199px) 50vw, 600px" quality={95} />
                  </span>
                </span>
              ))}
            </div>
            <div className="figma-test-mobile-art">
              <Image className="figma-test-coin coin-1" src="/figma-assets/design/7cfb9.png" alt="" width={220} height={220} priority unoptimized />
              <Image className="figma-test-coin coin-2" src="/figma-assets/design/86d23.png" alt="" width={180} height={180} priority unoptimized />
              <Image className="figma-test-coin coin-3" src="/figma-assets/design/86d23.png" alt="" width={100} height={100} unoptimized />
              <Image className="figma-test-coin coin-4" src="/figma-assets/design/f98dc.png" alt="" width={150} height={150} unoptimized />
              <Image className="figma-test-coin coin-5" src="/figma-assets/design/1f6a0.png" alt="" width={190} height={190} priority unoptimized />
              <Image className="figma-test-coin coin-6" src="/figma-assets/design/7cfb9.png" alt="" width={280} height={280} unoptimized />
              <Image className="figma-test-coin coin-7" src="/figma-assets/design/f98dc.png" alt="" width={260} height={260} unoptimized />
              <Image className="figma-test-coin coin-8" src="/figma-assets/design/86d23.png" alt="" width={300} height={300} unoptimized />
            </div>
          </div>
          <div className="ttt-test-entry-copy">
            <h1 id="finance-test-title">Bạn thường “tính” <br className="figma-test-desktop-break" />thế nào khi yêu?</h1>
            <p>Khám phá cách bạn thường nhìn nhận, ưu tiên và phản ứng khi tài chính xuất hiện trong một mối quan hệ.</p>
            <form onSubmit={start}>
              <button type="submit" className="ttt-pill-link">Bắt đầu test <Image className="ttt-pill-arrow" src="/figma-assets/design/1ed75.svg" alt="" width={15} height={14} aria-hidden="true" /></button>
            </form>
          </div>
        </section>
      );
    }
    return (
      <form onSubmit={start} className="rounded-[2rem] border border-[var(--line)] bg-[#fffdf7] p-6 shadow-[0_18px_50px_rgba(126,60,53,0.08)] sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{test.intro || "Một chút tò mò về mình"}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f9e6df] px-3 py-2 text-xs font-semibold text-[var(--accent)]">{test.questions.length} tình huống</span>
          <span className="rounded-full bg-[#edf3df] px-3 py-2 text-xs font-semibold text-[#658055]">{test.estimatedMinutes} phút</span>
          <span className="rounded-full bg-[#f4edf7] px-3 py-2 text-xs font-semibold text-[#77658a]">Mỗi câu chọn 1 đáp án</span>
        </div>
        <p className="mt-6 max-w-2xl text-[var(--muted)] leading-7">{test.note || "Hãy chọn câu trả lời gần với bạn nhất. Không có đáp án đúng hay sai."}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-[var(--ink)]">Tên của bạn<input value={respondentName} onChange={(event) => setRespondentName(event.target.value)} placeholder="Ví dụ: Minh" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 font-normal outline-none transition placeholder:text-[#b29e91] focus:border-[var(--accent)] focus:ring-4 focus:ring-[#c85a5020]" autoComplete="name" /></label>
          {test.kind === "compatibility" ? <label className="text-sm font-bold text-[var(--ink)]">Tên người cùng làm<input value={partnerName} onChange={(event) => setPartnerName(event.target.value)} placeholder="Ví dụ: An" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 font-normal outline-none transition placeholder:text-[#b29e91] focus:border-[var(--accent)] focus:ring-4 focus:ring-[#c85a5020]" autoComplete="name" /></label> : null}
        </div>
        {error ? <p className="mt-4 rounded-xl bg-[#fff0ea] px-4 py-3 text-sm text-[#a33d36]" role="alert">{error}</p> : null}
        <button type="submit" className="mt-7 min-h-12 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(200,90,80,0.2)] transition hover:bg-[#a9433d] active:translate-y-px">Bắt đầu khám phá <span aria-hidden="true">→</span></button>
      </form>
    );
  }

  return (
    <form onSubmit={handleQuestionSubmit} className={test.kind === "finance" ? "ttt-quiz-shell" : "rounded-[2rem] border border-[var(--line)] bg-[#fffdf7] p-5 sm:p-9"}>
      {test.kind === "finance" ? <>
        <Image className="ttt-quiz-decor top-left" src="/figma-assets/design/cfdf4.svg" alt="" width={383} height={383} aria-hidden="true" />
        <Image className="ttt-quiz-decor top-right" src="/figma-assets/design/ff629.svg" alt="" width={404} height={404} aria-hidden="true" />
        <Image className="ttt-quiz-decor bottom-left" src="/figma-assets/design/7604d.svg" alt="" width={472} height={472} aria-hidden="true" />
        <Image className="ttt-quiz-decor bottom-right" src="/figma-assets/design/fdebe.svg" alt="" width={432} height={432} aria-hidden="true" />
      </> : null}
      <div className={test.kind === "finance" ? "ttt-quiz-content" : "relative z-10"}>
        <div className={test.kind === "finance" ? "ttt-quiz-progress" : "flex items-center justify-between gap-4 text-xs font-bold text-[var(--muted)]"}>
          <span className={test.kind === "finance" ? "ttt-quiz-count" : "font-mono"}>Câu {current + 1}/{test.questions.length}</span>
          <div className={test.kind === "finance" ? "ttt-quiz-progress-track" : "mt-3 h-2 flex-1 overflow-hidden rounded-full bg-[#f2e4da]"} role="progressbar" aria-label="Tiến độ bài test" aria-valuemin={0} aria-valuemax={test.questions.length} aria-valuenow={current + 1}>
            <div className={test.kind === "finance" ? "ttt-quiz-progress-fill" : "h-full rounded-full bg-[var(--accent)]"} style={{ width: `${((current + 1) / test.questions.length) * 100}%` }} />
          </div>
        </div>
        <div key={question.key} className={test.kind === "finance" ? "ttt-quiz-question" : "mt-8"}>
          <h2 className={test.kind === "finance" ? "ttt-quiz-question-title" : "max-w-2xl text-2xl font-bold leading-tight text-[var(--ink)] sm:text-3xl"}>{question.prompt}</h2>
          <div className="mt-7">
            {test.kind === "finance" ? <AnswerGroup question={question} value={personA[question.key]} onChange={(value) => setPersonA((currentValue) => ({ ...currentValue, [question.key]: value }))} /> : <div className="grid gap-7"><AnswerGroup label={respondentName || "Người A"} question={question} value={personA[question.key]} onChange={(value) => setPersonA((currentValue) => ({ ...currentValue, [question.key]: value }))} /><div className="border-t border-dashed border-[var(--line)] pt-7"><AnswerGroup label={partnerName || "Người B"} question={question} value={personB[question.key]} onChange={(value) => setPersonB((currentValue) => ({ ...currentValue, [question.key]: value }))} /></div></div>}
          </div>
        </div>
        {error ? <p className="mt-6 rounded-xl bg-[#fff0ea] px-4 py-3 text-sm text-[#a33d36]" role="alert">{error}</p> : null}
      </div>
      <div className={test.kind === "finance" ? "ttt-quiz-actions" : "mt-8 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5"}>
        <button aria-label="Quay lại câu trước" type="button" disabled={current === 0 || loading} onClick={() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); setError(null); setCurrent((value) => Math.max(0, value - 1)); }} className={test.kind === "finance" ? "ttt-quiz-button" : "min-h-11 rounded-full px-2 py-3 text-sm font-bold text-[var(--muted)] disabled:opacity-35"}>{test.kind === "finance" ? <Image src="/figma-assets/design/c238c.svg" alt="" width={13} height={11} aria-hidden="true" /> : <span aria-hidden="true">←</span>}</button>
        <button aria-label={loading ? "Đang xem kết quả" : current === test.questions.length - 1 ? "Xem kết quả" : "Tiếp theo"} type="submit" disabled={loading || !selectedForCurrent} className={test.kind === "finance" ? "ttt-quiz-button" : "min-h-11 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"}>{test.kind === "finance" ? <Image src="/figma-assets/design/0f985.svg" alt="" width={13} height={11} aria-hidden="true" /> : <span aria-hidden="true">{loading ? "…" : current === test.questions.length - 1 ? "Xem kết quả" : "Tiếp theo →"}</span>}</button>
      </div>
    </form>
  );
}

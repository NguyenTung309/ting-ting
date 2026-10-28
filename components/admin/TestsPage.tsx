"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminPage, AdminPanel, LoadingState } from "@/components/admin/AdminPage";

type EditableTest = {
  slug: string;
  title: string;
  version: number;
  questions: { key: string; prompt: string; options: { key: string; label: string }[] }[];
};
type TestResponse = { test: EditableTest; updatedAt: string };
const fieldClass = "mt-1.5 w-full rounded-xl border border-[#d0d5dd] bg-white px-3.5 py-2.5 text-sm leading-6 text-[#344054] outline-none focus:border-[#ff8aa0] focus:ring-4 focus:ring-[#ff4164]/10";

export function TestsPage() {
  const [data, setData] = useState<TestResponse | null>(null);
  const [test, setTest] = useState<EditableTest | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchTest = useCallback(async () => {
    const response = await fetch("/api/admin/tests", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Không tải được bộ câu hỏi.");
    return body as TestResponse;
  }, []);

  useEffect(() => {
    let alive = true;
    void fetchTest().then((body) => { if (alive) { setError(""); setData(body); setTest(body.test); } }).catch((reason: unknown) => { if (alive) setError(reason instanceof Error ? reason.message : "Không tải được bộ câu hỏi."); });
    return () => { alive = false; };
  }, [fetchTest]);

  function updatePrompt(index: number, prompt: string) {
    setTest((current) => current ? ({ ...current, questions: current.questions.map((question, itemIndex) => itemIndex === index ? { ...question, prompt } : question) }) : current);
  }

  function updateOption(questionIndex: number, optionIndex: number, label: string) {
    setTest((current) => current ? ({ ...current, questions: current.questions.map((question, itemIndex) => itemIndex === questionIndex ? { ...question, options: question.options.map((option, answerIndex) => answerIndex === optionIndex ? { ...option, label } : option) } : question) }) : current);
  }

  async function save() {
    if (!test) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/tests", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ questions: test.questions }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không lưu được câu hỏi.");
      setTest((current) => current ? { ...current, version: body.version } : current);
      setData((current) => current ? { ...current, updatedAt: body.updatedAt } : current);
      setNotice(`Đã lưu phiên bản ${body.version}.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không lưu được câu hỏi."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <AdminPage title="Bộ câu hỏi" description="Chỉnh nội dung tình huống và đáp án của bài test đang hoạt động." action={<button type="button" onClick={() => void save()} disabled={!test || busy} className="rounded-xl bg-[#ff4164] px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_14px_rgba(255,65,100,0.2)] transition hover:bg-[#ee3155] disabled:opacity-50">{busy ? "Đang lưu…" : "Lưu thay đổi"}</button>} />
    {error && <div role="alert" className="rounded-xl border border-[#fecdca] bg-[#fff6f5] px-4 py-3 text-sm text-[#b42318]">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">{notice}</div>}
    {!test ? <LoadingState error={error || undefined} /> : <>
      <AdminPanel title={test.title} action={<span className="text-xs text-[#98a2b3]">Phiên bản {test.version}{data?.updatedAt ? ` · cập nhật ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.updatedAt))}` : ""}</span>}>
        <p className="mb-5 rounded-xl bg-[#fffaeb] px-4 py-3 text-xs leading-5 text-[#93370d]">Có thể sửa câu hỏi và nhãn đáp án. Mã đáp án, thứ tự, trọng số tính điểm và các nhóm kết quả được khóa để dữ liệu lượt làm cũ luôn giữ đúng ý nghĩa.</p>
        <div className="space-y-3">
          {test.questions.map((question, questionIndex) => <details key={question.key} className="group rounded-xl border border-[#eaecf0] bg-white open:bg-[#fcfcfd]">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 marker:hidden"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#fff0f3] text-xs font-bold text-[#f23b5e]">{questionIndex + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#344054]">{question.prompt}</span><span className="text-xs text-[#98a2b3]">{question.options.length} đáp án</span></summary>
            <div className="space-y-4 border-t border-[#f0f1f5] px-4 py-4 sm:px-5">
              <label className="block text-xs font-semibold text-[#475467]">Tình huống<textarea rows={3} maxLength={1500} value={question.prompt} onChange={(event) => updatePrompt(questionIndex, event.target.value)} className={`${fieldClass} resize-y`} /></label>
              <div className="grid gap-3 lg:grid-cols-2">{question.options.map((option, optionIndex) => <label key={option.key} className="block text-xs font-semibold text-[#475467]">Đáp án {String.fromCharCode(65 + optionIndex)}<textarea rows={3} maxLength={600} value={option.label} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} className={`${fieldClass} resize-y`} /></label>)}</div>
            </div>
          </details>)}
        </div>
      </AdminPanel>
      <div className="flex justify-end"><button type="button" onClick={() => void save()} disabled={busy} className="rounded-xl bg-[#ff4164] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ee3155] disabled:opacity-50">{busy ? "Đang lưu…" : "Lưu toàn bộ câu hỏi"}</button></div>
    </>}
  </div>;
}

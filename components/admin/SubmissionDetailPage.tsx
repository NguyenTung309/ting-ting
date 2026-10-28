"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminPage, AdminPanel, LoadingState } from "@/components/admin/AdminPage";

type QuestionSnapshot = { key: string; prompt: string; options: { key: string; label: string }[]; selectedOption?: string; personA?: { selectedOption?: string }; personB?: { selectedOption?: string } };
type SubmissionDetail = { id: string; name: string; partnerName: string; test: string; kind: string; version: number; result: string; resultKey: string; code: string; submittedAt: string; user: { name: string; email: string } | null; answers: Record<string, unknown>; questionSnapshot: QuestionSnapshot[]; scoringNotes: { question?: string; selectedOption?: string; contributions?: { managerTag: string; points: number }[] }[]; rawScores: Record<string, number>; adjustedScores: Record<string, number>; scores: Record<string, number>; score: number | null; formulaVersion: number };
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" });
function date(value: string) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "—" : dateFormat.format(parsed); }

export function SubmissionDetailPage({ id }: { id: string }) {
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/submissions/${encodeURIComponent(id)}`, { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không tải được lượt làm bài.");
      return body.submission as SubmissionDetail;
    }).then((value) => { if (alive) setSubmission(value); }).catch((reason: unknown) => { if (alive) setError(reason instanceof Error ? reason.message : "Không tải được lượt làm bài."); });
    return () => { alive = false; };
  }, [id]);

  if (!submission) return <div className="space-y-6"><AdminPage title="Chi tiết lượt làm" description="Câu trả lời, kết quả và thông tin tài khoản." action={<Link href="/admin/submissions" className="text-sm font-semibold text-[#ff4164]">← Danh sách</Link>} /><LoadingState error={error || undefined} /></div>;
  const questions = submission.questionSnapshot;
  const rawAnswers = submission.answers as Record<string, unknown>;
  return <div className="space-y-6">
    <AdminPage title="Chi tiết lượt làm" description={`${submission.test === "finance-trend" ? "Xu hướng tài chính" : submission.test} · phiên bản ${submission.version} · ${date(submission.submittedAt)}`} action={<Link href="/admin/submissions" className="text-sm font-semibold text-[#ff4164]">← Danh sách</Link>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[{ label: "Người làm", value: submission.name }, { label: "Tài khoản Google", value: submission.user?.email || "Chưa đăng nhập khi làm bài" }, { label: "Kết quả", value: submission.result }, { label: "Mã lượt làm", value: submission.code || "—" }].map((item) => <div key={item.label} className="rounded-2xl border border-[#eaecf0] bg-white p-5"><p className="text-xs font-medium text-[#98a2b3]">{item.label}</p><p className="mt-2 break-words text-sm font-bold text-[#344054]">{item.value}</p>{item.label === "Người làm" && submission.partnerName && <p className="mt-1 text-xs text-[#667085]">Cùng làm: {submission.partnerName}</p>}</div>)}
    </div>
    {questions.length ? <AdminPanel title={`Câu trả lời (${questions.length})`}>
      <div className="space-y-4">{questions.map((question, index) => {
        const answer = rawAnswers[question.key];
        const selected = question.selectedOption || (typeof answer === "string" ? question.options.find((option) => option.key === answer)?.label : "");
        return <article key={question.key} className="rounded-xl border border-[#eaecf0] p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#ff4164]">Câu {index + 1}</p><h2 className="mt-2 text-sm font-semibold leading-6 text-[#344054]">{question.prompt}</h2>
          {question.personA || question.personB ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{[{ label: submission.name || "Người A", response: question.personA }, { label: submission.partnerName || "Người B", response: question.personB }].map((person) => <div key={person.label} className="rounded-lg bg-[#f9fafb] p-3"><p className="text-xs font-semibold text-[#667085]">{person.label}</p><p className="mt-1 text-sm leading-5 text-[#344054]">{person.response?.selectedOption || "Chưa có dữ liệu cũ"}</p></div>)}</div> : <p className="mt-3 rounded-lg bg-[#ecfdf3] px-3 py-2.5 text-sm leading-5 text-[#027a48]"><span className="font-semibold">Đã chọn: </span>{selected || "Chưa có snapshot câu hỏi của lượt cũ"}</p>}
          {question.options.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-[#667085]">Xem các đáp án tại thời điểm làm</summary><ul className="mt-2 space-y-1 pl-4 text-xs leading-5 text-[#667085]">{question.options.map((option) => <li key={option.key} className={option.label === selected ? "font-semibold text-[#027a48]" : ""}>{option.key.toUpperCase()}. {option.label}{option.label === selected ? " · đã chọn" : ""}</li>)}</ul></details>}
        </article>;
      })}</div>
    </AdminPanel> : <AdminPanel title="Dữ liệu câu trả lời"><p className="text-sm leading-6 text-[#667085]">Lượt làm cũ chưa có snapshot nội dung câu hỏi; dữ liệu câu trả lời thô vẫn được giữ để đối chiếu.</p><pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-[#f9fafb] p-4 text-xs text-[#344054]">{JSON.stringify(rawAnswers, null, 2)}</pre></AdminPanel>}
    <AdminPanel title="Ghi chú chấm điểm"><div className="grid gap-4 sm:grid-cols-2">{Object.entries(submission.scores).map(([key, value]) => <div key={key} className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-4 py-3 text-sm"><span className="font-medium text-[#475467]">{key}</span><strong className="text-[#344054]">{value}</strong></div>)}</div>
      {submission.scoringNotes.length > 0 ? <div className="mt-4 space-y-2">{submission.scoringNotes.map((note, index) => <div key={`${note.question}-${index}`} className="rounded-lg border border-[#eaecf0] px-4 py-3 text-xs leading-5"><p className="font-semibold text-[#344054]">{note.question || `Câu ${index + 1}`}</p><p className="mt-1 text-[#667085]">Chọn: {note.selectedOption || "—"}</p><p className="mt-1 text-[#98a2b3]">{(note.contributions || []).map((item) => `${item.managerTag} +${item.points}`).join(" · ")}</p></div>)}</div> : <p className="mt-4 text-sm text-[#98a2b3]">Không có ghi chú chấm điểm cho lượt này.</p>}
      {submission.score !== null && <p className="mt-4 text-sm font-semibold text-[#344054]">Điểm tổng hợp: {submission.score}/100 · công thức v{submission.formulaVersion}</p>}
      {Object.keys(submission.adjustedScores).length > 0 && <p className="mt-2 text-xs text-[#667085]">Điểm hiệu chỉnh: {Object.entries(submission.adjustedScores).map(([key, value]) => `${key} ${value}`).join(" · ")}</p>}
    </AdminPanel>
  </div>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminPage, AdminPanel, LoadingState } from "@/components/admin/AdminPage";

type Submission = { id: string; name: string; partnerName: string; userEmail: string; test: string; result: string; code: string; submittedAt: string };
type SubmissionsResponse = { total: number; page: number; totalPages: number; items: Submission[] };
const formatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : formatter.format(date); }

export function SubmissionsPage() {
  const [data, setData] = useState<SubmissionsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    void fetch(`/api/admin/submissions?page=${page}`, { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không tải được lượt làm bài.");
      return body as SubmissionsResponse;
    }).then((body) => { if (alive) { setError(""); setData(body); } }).catch((reason: unknown) => { if (alive) setError(reason instanceof Error ? reason.message : "Không tải được lượt làm bài."); });
    return () => { alive = false; };
  }, [page]);

  return <div className="space-y-6">
    <AdminPage title="Lượt làm bài" description="Danh sách lượt gửi form đã được lưu cùng mã tra cứu kết quả." />
    {!data ? <LoadingState error={error || undefined} /> : <AdminPanel title={`${data.total.toLocaleString("vi-VN")} lượt gửi`}>
      <div className="-mx-5 overflow-x-auto sm:-mx-6"><table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead><tr className="border-y border-[#f0f1f5] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#98a2b3]"><th className="px-6 py-3">Người làm</th><th className="px-4 py-3">Bài test</th><th className="px-4 py-3">Kết quả</th><th className="px-4 py-3">Mã tra cứu</th><th className="px-6 py-3 text-right">Thời gian gửi</th></tr></thead>
        <tbody>{data.items.map((item) => <tr key={item.id} className="border-b border-[#f2f4f7] last:border-0"><td className="px-6 py-4"><Link href={`/admin/submissions/${encodeURIComponent(item.id)}`} className="font-semibold text-[#344054] hover:text-[#ff4164]">{item.name}</Link>{item.userEmail && <span className="mt-1 block text-xs text-[#98a2b3]">{item.userEmail}</span>}{item.partnerName && <span className="mt-1 block text-xs text-[#667085]">Cùng làm: {item.partnerName}</span>}</td><td className="px-4 py-4 text-[#667085]">{item.test === "finance-trend" ? "Xu hướng tài chính" : item.test || "—"}</td><td className="px-4 py-4 text-[#667085]">{item.result}</td><td className="px-4 py-4 font-mono text-xs text-[#667085]">{item.code || "—"}</td><td className="px-6 py-4 text-right text-xs text-[#98a2b3]">{formatDate(item.submittedAt)}</td></tr>)}</tbody>
      </table></div>
      {error && <p className="mt-4 text-sm text-[#b42318]">{error}</p>}
      {data.items.length === 0 && <div className="py-10 text-center text-sm text-[#98a2b3]">Chưa có lượt gửi bài được lưu.</div>}
      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-[#667085]"><span>Trang {data.page} / {Math.max(data.totalPages, 1)}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#eaecf0] px-3 py-2 disabled:opacity-40">Trước</button><button disabled={page >= data.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#eaecf0] px-3 py-2 disabled:opacity-40">Sau</button></div></div>
    </AdminPanel>}
  </div>;
}

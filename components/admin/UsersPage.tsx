"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminPage, AdminPanel, EmptyState, LoadingState, StatusPill } from "@/components/admin/AdminPage";

type UserRow = { id: string; name: string; email: string; avatar: string; status: "active" | "blocked"; createdAt: string; lastSeenAt: string };
type UserResponse = { total: number; page: number; totalPages: number; items: UserRow[] };
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });
function date(value: string) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "—" : dateFormat.format(parsed); }

export function UsersPage() {
  const [result, setResult] = useState<UserResponse | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`/api/admin/users?page=${page}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không tải được người dùng.");
      setResult(body as UserResponse);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được người dùng."); }
  }, [page]);

  // This effect starts a network request; state updates happen after the request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function toggleStatus(user: UserRow) {
    const status = user.status === "blocked" ? "active" : "blocked";
    setBusy(user.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không cập nhật được tài khoản.");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không cập nhật được tài khoản."); }
    finally { setBusy(""); }
  }

  const filtered = (result?.items || []).filter((user) => `${user.name} ${user.email}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));

  return <div className="space-y-6">
    <AdminPage title="Người dùng" description="Xem tài khoản đã đăng nhập và khóa hoặc mở lại quyền sử dụng." />
    {error && <div role="alert" className="rounded-xl border border-[#fecdca] bg-[#fff6f5] px-4 py-3 text-sm text-[#b42318]">{error}</div>}
    {!result ? <LoadingState error={error || undefined} /> : <AdminPanel title={`${result.total.toLocaleString("vi-VN")} tài khoản`}>
      <div className="mb-5"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email…" className="w-full max-w-sm rounded-xl border border-[#d0d5dd] bg-white px-4 py-2.5 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#ff8aa0] focus:ring-4 focus:ring-[#ff4164]/10" /></div>
      <div className="-mx-5 overflow-x-auto sm:-mx-6"><table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead><tr className="border-y border-[#f0f1f5] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#98a2b3]"><th className="px-6 py-3">Tài khoản</th><th className="px-4 py-3">Ngày tham gia</th><th className="px-4 py-3">Hoạt động gần đây</th><th className="px-4 py-3">Trạng thái</th><th className="px-6 py-3 text-right">Thao tác</th></tr></thead>
        <tbody>{filtered.map((user) => <tr key={user.id} className="border-b border-[#f2f4f7] last:border-0">
          <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0f3] font-bold text-[#f23b5e]">{user.name.trim().charAt(0).toUpperCase()}</span><span className="min-w-0"><strong className="block truncate font-semibold text-[#344054]">{user.name}</strong><span className="mt-0.5 block truncate text-xs text-[#98a2b3]">{user.email}</span></span></div></td>
          <td className="px-4 py-4 text-[#667085]">{date(user.createdAt)}</td><td className="px-4 py-4 text-[#667085]">{date(user.lastSeenAt)}</td>
          <td className="px-4 py-4"><StatusPill tone={user.status === "blocked" ? "red" : "green"}>{user.status === "blocked" ? "Đã khóa" : "Đang hoạt động"}</StatusPill></td>
          <td className="px-6 py-4 text-right"><button disabled={busy === user.id} onClick={() => void toggleStatus(user)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${user.status === "blocked" ? "bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]" : "bg-[#fef3f2] text-[#b42318] hover:bg-[#fee4e2]"}`}>{busy === user.id ? "Đang lưu…" : user.status === "blocked" ? "Mở khóa" : "Khóa tài khoản"}</button></td>
        </tr>)}</tbody>
      </table></div>
      {filtered.length === 0 && <div className="py-10"><EmptyState>Không tìm thấy người dùng phù hợp.</EmptyState></div>}
      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-[#667085]"><span>Trang {result.page} / {Math.max(result.totalPages, 1)}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#eaecf0] px-3 py-2 disabled:opacity-40">Trước</button><button disabled={page >= result.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#eaecf0] px-3 py-2 disabled:opacity-40">Sau</button></div></div>
    </AdminPanel>}
  </div>;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AdminPage, AdminPanel, LoadingState } from "@/components/admin/AdminPage";
import type { FinanceProfileCode, FinanceResultType } from "@/lib/tests/result-analytics";

type DashboardData = {
  totalSubmissions: number;
  submissionsLast30Days: number;
  totalUsers: number;
  analytics: {
    totalTests: number;
    uniqueUsers: number;
    pure: { count: number; percentage: number };
    hybrid: { count: number; percentage: number };
    profileDistribution: { code: FinanceProfileCode; name: string; count: number; percentage: number }[];
  };
  recentSubmissions: { id: string; name: string; email: string; test: string; result: string; code: string; submittedAt: string }[];
};

type FilterState = { startDate: string; endDate: string; resultType: "" | FinanceResultType; finalProfile: "" | FinanceProfileCode };

const numberFormat = new Intl.NumberFormat("vi-VN");
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

function buildFilterQuery(filters: FilterState) {
  const query = new URLSearchParams();
  if (filters.startDate) query.set("startDate", filters.startDate);
  if (filters.endDate) query.set("endDate", filters.endDate);
  if (filters.resultType) query.set("resultType", filters.resultType);
  if (filters.finalProfile) query.set("finalProfile", filters.finalProfile);
  return query.toString();
}

function StatCard({ label, value, detail, tone, icon }: { label: string; value: number; detail: string; tone: string; icon: string }) {
  return (
    <article className="rounded-2xl border border-[#eaecf0] bg-white p-5 shadow-[0_2px_8px_rgba(16,24,40,0.03)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-[#667085]">{label}</p><p className="mt-3 text-[30px] font-bold tracking-tight text-[#1d2939]">{numberFormat.format(value)}</p></div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${tone}`}>{icon}</span>
      </div>
      <p className="mt-4 text-xs font-medium text-[#98a2b3]">{detail}</p>
    </article>
  );
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<FilterState>({ startDate: "", endDate: "", resultType: "", finalProfile: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const filterQuery = useMemo(() => buildFilterQuery(filters), [filters]);
  const exportUrl = `/api/admin/dashboard/export${filterQuery ? `?${filterQuery}` : ""}`;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setLoading(true);
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const clearFilters = () => {
    setLoading(true);
    setFilters({ startDate: "", endDate: "", resultType: "", finalProfile: "" });
  };

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/dashboard${filterQuery ? `?${filterQuery}` : ""}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Không tải được dashboard.");
        return result as DashboardData;
      })
      .then((result) => { if (alive) { setData(result); setError(""); } })
      .catch((reason: unknown) => { if (alive) setError(reason instanceof Error ? reason.message : "Không tải được dashboard."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [filterQuery]);

  if (error && !data) return <div className="space-y-6"><AdminPage title="Result Analytics" description="Thống kê kết quả bài test xu hướng tài chính." /> <LoadingState error={error} /></div>;
  if (!data) return <div className="space-y-6"><AdminPage title="Result Analytics" description="Thống kê kết quả bài test xu hướng tài chính." /> <LoadingState /></div>;

  return (
    <div className="space-y-6">
      <AdminPage
        title="Result Analytics"
        description="Theo dõi lượt hoàn thành, mức độ duy nhất của người làm và phân bố 15 profile tài chính."
        action={<a href={exportUrl} className="inline-flex items-center justify-center rounded-xl bg-[#ff4164] px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_14px_rgba(255,65,100,0.18)] hover:bg-[#eb3657]">Xuất CSV ↓</a>}
      />

      <AdminPanel title="Bộ lọc">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-semibold text-[#667085]">Từ ngày<input type="date" value={filters.startDate} onChange={(event) => updateFilter("startDate", event.target.value)} className="mt-2 block h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]" /></label>
          <label className="text-xs font-semibold text-[#667085]">Đến ngày<input type="date" value={filters.endDate} onChange={(event) => updateFilter("endDate", event.target.value)} className="mt-2 block h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]" /></label>
          <label className="text-xs font-semibold text-[#667085]">Loại kết quả<select value={filters.resultType} onChange={(event) => updateFilter("resultType", event.target.value as FilterState["resultType"])} className="mt-2 block h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"><option value="">Thuần và Lai</option><option value="Pure">Pure · Thuần</option><option value="Hybrid">Hybrid · Lai</option></select></label>
          <label className="text-xs font-semibold text-[#667085]">Final Profile<select value={filters.finalProfile} onChange={(event) => updateFilter("finalProfile", event.target.value as FilterState["finalProfile"])} className="mt-2 block h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"><option value="">Tất cả 15 profile</option>{data.analytics.profileDistribution.map((profile) => <option key={profile.code} value={profile.code}>{profile.code} · {profile.name}</option>)}</select></label>
          <div className="flex items-end"><button onClick={clearFilters} disabled={!filterQuery} className="h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-semibold text-[#475467] hover:bg-[#f9fafb] disabled:cursor-default disabled:opacity-50">Xóa bộ lọc</button></div>
        </div>
        {loading && <p className="mt-3 text-xs text-[#98a2b3]">Đang cập nhật số liệu…</p>}
        {error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}
      </AdminPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tests" value={data.analytics.totalTests} detail="Tất cả lượt hoàn thành theo bộ lọc" tone="bg-[#fff0f3] text-[#ff4164]" icon="↗" />
        <StatCard label="Unique Users" value={data.analytics.uniqueUsers} detail="Đăng nhập theo user ID; khách theo session ID" tone="bg-[#eef4ff] text-[#4e7df1]" icon="♙" />
        <StatCard label="Pure · Thuần" value={data.analytics.pure.count} detail={`${data.analytics.pure.percentage.toFixed(1)}% tổng lượt test`} tone="bg-[#ecfdf3] text-[#039855]" icon="1" />
        <StatCard label="Hybrid · Lai" value={data.analytics.hybrid.count} detail={`${data.analytics.hybrid.percentage.toFixed(1)}% tổng lượt test`} tone="bg-[#fff7e8] text-[#c97a12]" icon="2" />
      </div>

      <AdminPanel title="15 Profile Distribution" action={<span className="text-xs text-[#98a2b3]">Kết quả mới nhất của mỗi người</span>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead><tr className="border-y border-[#f0f1f5] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#98a2b3]"><th className="px-4 py-3">Profile</th><th className="px-4 py-3">Tên profile</th><th className="px-4 py-3">Phân bố</th><th className="px-4 py-3 text-right">Người</th><th className="px-4 py-3 text-right">Tỷ lệ</th></tr></thead>
          <tbody>{data.analytics.profileDistribution.map((profile) => <tr key={profile.code} className="border-b border-[#f2f4f7] last:border-0">
            <td className="px-4 py-3 font-mono text-xs font-bold text-[#475467]">{profile.code}</td>
            <td className="px-4 py-3 font-semibold text-[#344054]">{profile.name}</td>
            <td className="w-[35%] px-4 py-3"><div className="h-2.5 overflow-hidden rounded-full bg-[#f2f4f7]"><div className="h-full rounded-full bg-[#ff6681]" style={{ width: `${profile.percentage}%` }} /></div></td>
            <td className="px-4 py-3 text-right tabular-nums text-[#475467]">{numberFormat.format(profile.count)}</td>
            <td className="px-4 py-3 text-right tabular-nums text-[#667085]">{profile.percentage.toFixed(1)}%</td>
          </tr>)}</tbody>
        </table></div>
        <p className="mt-4 text-xs leading-5 text-[#98a2b3]">Total Tests và tỷ lệ Pure/Hybrid tính theo lượt. Bảng profile đếm người dùng, dùng kết quả mới nhất trong phạm vi bộ lọc.</p>
      </AdminPanel>

      <AdminPanel title="Lượt hoàn thành gần đây" action={<Link href="/admin/submissions" className="text-xs font-bold text-[#ff4164] hover:underline">Tất cả lượt làm bài →</Link>}>
        <div className="-mx-5 overflow-x-auto sm:-mx-6"><table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead><tr className="border-y border-[#f0f1f5] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#98a2b3]"><th className="px-6 py-3">Người làm</th><th className="px-4 py-3">Bài test</th><th className="px-4 py-3">Kết quả</th><th className="px-4 py-3">Mã tra cứu</th><th className="px-6 py-3 text-right">Thời gian</th></tr></thead>
          <tbody>{data.recentSubmissions.length ? data.recentSubmissions.map((item) => <tr key={item.id} className="border-b border-[#f2f4f7] last:border-0"><td className="px-6 py-4"><Link href={`/admin/submissions/${encodeURIComponent(item.id)}`} className="font-semibold text-[#344054] hover:text-[#ff4164]">{item.name}</Link>{item.email && <span className="mt-1 block text-xs text-[#98a2b3]">{item.email}</span>}</td><td className="px-4 py-4 text-[#667085]">{item.test === "finance-trend" ? "Xu hướng tài chính" : item.test || "—"}</td><td className="px-4 py-4 text-[#667085]">{item.result}</td><td className="px-4 py-4 font-mono text-xs text-[#667085]">{item.code || "—"}</td><td className="px-6 py-4 text-right text-xs text-[#98a2b3]">{formatDate(item.submittedAt)}</td></tr>) : <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#98a2b3]">Chưa có lượt làm bài.</td></tr>}</tbody>
        </table></div>
      </AdminPanel>
      <p className="px-1 text-xs text-[#98a2b3]">Dashboard tổng hợp các bản ghi `test-submissions` đã lưu trong cơ sở dữ liệu ứng dụng.</p>
    </div>
  );
}

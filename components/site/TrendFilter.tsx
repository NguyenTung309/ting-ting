"use client";

import { useRouter } from "next/navigation";

export function TrendFilter({ selectedKind, searchQuery }: { selectedKind: "all" | "base" | "hybrid"; searchQuery: string }) {
  const router = useRouter();
  return <label className="figma-trend-filter">
    <span className="sr-only">Lọc xu hướng</span>
    <select value={selectedKind} onChange={(event) => {
      const params = new URLSearchParams({ kind: event.target.value });
      if (searchQuery) params.set("q", searchQuery);
      router.push(`/kho-tang-tinh-cach?${params.toString()}#library-controls`);
    }}>
      <option value="all">Tất cả 15 xu hướng</option>
      <option value="base">5 xu hướng chính</option>
      <option value="hybrid">10 xu hướng kết hợp</option>
    </select>
  </label>;
}

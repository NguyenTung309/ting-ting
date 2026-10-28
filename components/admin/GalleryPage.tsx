"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AdminPage, AdminPanel, EmptyState, LoadingState } from "@/components/admin/AdminPage";

type MediaItem = { id: string; url: string; alt: string; filename: string; width: number | null; height: number | null; updatedAt: string };
const inputClass = "mt-1.5 w-full rounded-xl border border-[#d0d5dd] bg-white px-3.5 py-2.5 text-sm text-[#344054] outline-none placeholder:text-[#98a2b3] focus:border-[#ff8aa0] focus:ring-4 focus:ring-[#ff4164]/10";

export function GalleryPage() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/gallery", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Không tải được gallery.");
    setItems(body.items as MediaItem[]); setTotal(Number(body.total || 0));
  }, []);
  // This effect starts a network request; state updates happen after the request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Không tải được gallery.")); }, [load]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError("Chọn ảnh trước khi tải lên."); return; }
    const form = new FormData(); form.set("file", file); form.set("alt", alt);
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/gallery", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Tải ảnh lên chưa thành công.");
      setFile(null); setAlt(""); if (inputRef.current) inputRef.current.value = "";
      await load(); setNotice("Đã tải ảnh vào thư viện.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Tải ảnh lên chưa thành công."); }
    finally { setBusy(false); }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Xóa ảnh “${item.alt || item.filename}”?`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/gallery/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "Không xóa được ảnh.");
      await load(); setNotice("Đã xóa ảnh khỏi thư viện.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không xóa được ảnh."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <AdminPage title="Thư viện ảnh" description="Tải lên và quản lý hình ảnh được dùng trong bài blog. Ảnh tối đa 12 MB, cần có văn bản thay thế." />
    {error && <div role="alert" className="rounded-xl border border-[#fecdca] bg-[#fff6f5] px-4 py-3 text-sm text-[#b42318]">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">{notice}</div>}
    <AdminPanel title="Thêm hình ảnh">
      <form onSubmit={upload} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block text-xs font-semibold text-[#475467]">Tệp ảnh<input ref={inputRef} type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#fff0f3] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#f23b5e]`} /></label>
        <label className="block text-xs font-semibold text-[#475467]">Văn bản thay thế<input required value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={300} className={inputClass} placeholder="Mô tả nội dung hình ảnh" /></label>
        <button disabled={busy} type="submit" className="rounded-xl bg-[#ff4164] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ee3155] disabled:opacity-50">{busy ? "Đang tải…" : "Tải lên"}</button>
      </form>
    </AdminPanel>

    {!items ? <LoadingState error={error || undefined} /> : <AdminPanel title={`${total.toLocaleString("vi-VN")} hình ảnh`}>
      {items.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((item) => <article key={item.id} className="overflow-hidden rounded-xl border border-[#eaecf0] bg-white">
          <div className="aspect-[4/3] bg-[#f2f4f7]"><img src={item.url} alt={item.alt} loading="lazy" className="h-full w-full object-cover" /></div>
          <div className="p-3.5"><p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#344054]">{item.alt || item.filename}</p><p className="mt-1 truncate text-xs text-[#98a2b3]">{item.filename}{item.width && item.height ? ` · ${item.width} × ${item.height}` : ""}</p><div className="mt-3 flex items-center justify-between gap-2"><button onClick={() => navigator.clipboard.writeText(new URL(item.url, window.location.origin).toString()).then(() => setNotice("Đã sao chép đường dẫn ảnh."))} className="text-xs font-semibold text-[#4e7df1] hover:underline">Sao chép URL</button><button disabled={busy} onClick={() => void remove(item)} className="text-xs font-semibold text-[#b42318] hover:underline disabled:opacity-50">Xóa</button></div></div>
        </article>)}
      </div> : <EmptyState>Thư viện chưa có ảnh nào.</EmptyState>}
    </AdminPanel>}
  </div>;
}

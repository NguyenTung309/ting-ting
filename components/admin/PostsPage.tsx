"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { AdminPage, AdminPanel, EmptyState, LoadingState, StatusPill } from "@/components/admin/AdminPage";

type Post = { id: string; title: string; slug: string; excerpt: string; content: string; status: "published" | "draft"; category: string; categoryId: string; coverId: string; coverUrl: string; coverAlt: string; tagsText: string; seoTitle: string; seoDescription: string; seoImageId: string; seoImageUrl: string; seoCanonicalUrl: string; seoNoIndex: boolean; publishedAt: string; updatedAt: string };
type Choice = { id: string; title: string };
type MediaChoice = { id: string; url: string; alt: string; filename: string };
type PostResponse = { posts: Post[]; total: number; categories: Choice[]; media: MediaChoice[] };
const blankPost = (): Post => ({ id: "", title: "", slug: "", excerpt: "", content: "", status: "draft", category: "", categoryId: "", coverId: "", coverUrl: "", coverAlt: "", tagsText: "", seoTitle: "", seoDescription: "", seoImageId: "", seoImageUrl: "", seoCanonicalUrl: "", seoNoIndex: false, publishedAt: "", updatedAt: "" });
const inputClass = "mt-1.5 w-full rounded-xl border border-[#d0d5dd] bg-white px-3.5 py-2.5 text-sm text-[#344054] outline-none placeholder:text-[#98a2b3] focus:border-[#ff8aa0] focus:ring-4 focus:ring-[#ff4164]/10";
const labelClass = "block text-xs font-semibold text-[#475467]";

export function PostsPage() {
  const [data, setData] = useState<PostResponse | null>(null);
  const [post, setPost] = useState<Post>(blankPost());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchPosts = useCallback(async () => {
    const response = await fetch("/api/admin/posts", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Không tải được bài viết.");
    return body as PostResponse;
  }, []);

  const load = useCallback(async (selectId?: string) => {
    const body = await fetchPosts();
    setError("");
    setData(body);
    if (selectId) setPost(body.posts.find((item) => item.id === selectId) || blankPost());
  }, [fetchPosts]);

  useEffect(() => {
    let alive = true;
    void fetchPosts().then((body) => { if (alive) { setError(""); setData(body); } }).catch((reason: unknown) => { if (alive) setError(reason instanceof Error ? reason.message : "Không tải được bài viết."); });
    return () => { alive = false; };
  }, [fetchPosts]);

  function update(field: keyof Post, value: string) { setPost((current) => ({ ...current, [field]: value })); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(post.id ? `/api/admin/posts/${encodeURIComponent(post.id)}` : "/api/admin/posts", {
        method: post.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, status: post.status, categoryId: post.categoryId, coverId: post.coverId || "", coverAlt: post.coverAlt, tagsText: post.tagsText, seoTitle: post.seoTitle, seoDescription: post.seoDescription, seoImageId: post.seoImageId, seoCanonicalUrl: post.seoCanonicalUrl, seoNoIndex: post.seoNoIndex, publishedAt: post.publishedAt }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không lưu được bài viết.");
      await load(body.post.id);
      setNotice(post.status === "published" ? "Bài viết đã xuất bản." : "Bản nháp đã được lưu.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không lưu được bài viết."); }
    finally { setBusy(false); }
  }

  async function removePost() {
    if (!post.id || !window.confirm(`Xóa bài viết “${post.title}”?`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(post.id)}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không xóa được bài viết.");
      setPost(blankPost()); await load(); setNotice("Đã xóa bài viết.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không xóa được bài viết."); }
    finally { setBusy(false); }
  }

  if (!data && !error) return <div className="space-y-6"><AdminPage title="Bài viết blog" description="Soạn thảo bài viết, lưu nháp hoặc xuất bản lên website." /><LoadingState /></div>;

  return <div className="space-y-6">
    <AdminPage title="Bài viết blog" description="Soạn thảo, lưu nháp hoặc xuất bản nội dung lên website." action={<button type="button" onClick={() => { setPost(blankPost()); setNotice(""); setError(""); }} className="rounded-xl bg-[#ff4164] px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_14px_rgba(255,65,100,0.2)] transition hover:bg-[#ee3155]">+ Bài viết mới</button>} />
    {error && <div role="alert" className="rounded-xl border border-[#fecdca] bg-[#fff6f5] px-4 py-3 text-sm text-[#b42318]">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">{notice}</div>}
    {!data ? <LoadingState error={error || undefined} /> : <div className="grid items-start gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
      <AdminPanel title={`Bài viết (${data.total})`} className="xl:sticky xl:top-[100px]">
        <div className="max-h-[420px] space-y-2 overflow-y-auto xl:max-h-[calc(100vh-230px)]">
          {data.posts.map((item) => <button key={item.id} type="button" onClick={() => { setPost(item); setNotice(""); setError(""); }} className={`w-full rounded-xl border p-3.5 text-left transition ${post.id === item.id ? "border-[#ff9aad] bg-[#fff7f8]" : "border-[#eaecf0] hover:border-[#d0d5dd] hover:bg-[#fafbfc]"}`}>
            <span className="flex items-start justify-between gap-2"><strong className="line-clamp-2 text-sm font-semibold leading-5 text-[#344054]">{item.title}</strong><StatusPill tone={item.status === "published" ? "green" : "orange"}>{item.status === "published" ? "Đã đăng" : "Nháp"}</StatusPill></span>
            <span className="mt-2 block truncate text-xs text-[#98a2b3]">/{item.slug}</span>
            <span className="mt-1 block text-[11px] text-[#b0b7c3]">Cập nhật {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</span>
          </button>)}
          {data.posts.length === 0 && <EmptyState>Chưa có bài viết. Tạo bài đầu tiên ở đây.</EmptyState>}
        </div>
      </AdminPanel>

      <form onSubmit={save} className="space-y-6">
        <AdminPanel title={post.id ? "Chỉnh sửa bài viết" : "Bài viết mới"} action={post.id && <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#ff4164] hover:underline">Xem trên website ↗</a>}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>Tiêu đề<input required maxLength={180} value={post.title} onChange={(event) => update("title", event.target.value)} className={inputClass} placeholder="Nhập tiêu đề bài viết" /></label>
            <label className={labelClass}>Đường dẫn<input value={post.slug} onChange={(event) => update("slug", event.target.value)} className={inputClass} placeholder="tu-dong-tao-tu-tieu-de" /><span className="mt-1.5 block font-normal text-[#98a2b3]">Để trống để tạo từ tiêu đề.</span></label>
            <label className={labelClass}>Trạng thái<select value={post.status} onChange={(event) => update("status", event.target.value)} className={inputClass}><option value="draft">Bản nháp</option><option value="published">Xuất bản</option></select></label>
            <label className={labelClass}>Ngày xuất bản<input type="datetime-local" value={post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : ""} onChange={(event) => update("publishedAt", event.target.value ? new Date(event.target.value).toISOString() : "")} className={inputClass} /><span className="mt-1.5 block font-normal text-[#98a2b3]">Để trống để hệ thống ghi thời điểm xuất bản.</span></label>
            <label className={`${labelClass} sm:col-span-2`}>Mô tả ngắn<textarea required rows={3} maxLength={500} value={post.excerpt} onChange={(event) => update("excerpt", event.target.value)} className={`${inputClass} resize-y`} placeholder="Tóm tắt nội dung bài viết" /></label>
            <label className={labelClass}>Chuyên mục<select value={post.categoryId} onChange={(event) => update("categoryId", event.target.value)} className={inputClass}><option value="">Chưa phân loại</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label>
            <label className={labelClass}>Thẻ nội dung<input value={post.tagsText} onChange={(event) => update("tagsText", event.target.value)} className={inputClass} placeholder="tài chính, tình yêu, giao tiếp" /><span className="mt-1.5 block font-normal text-[#98a2b3]">Phân tách bằng dấu phẩy; dùng làm từ khóa bài viết.</span></label>
            <label className={labelClass}>Ảnh bìa<select value={post.coverId} onChange={(event) => { const selected = data.media.find((item) => item.id === event.target.value); setPost((current) => ({ ...current, coverId: event.target.value, coverUrl: selected?.url || "", coverAlt: selected?.alt || current.coverAlt })); }} className={inputClass}><option value="">Không dùng ảnh bìa</option>{data.media.map((item) => <option key={item.id} value={item.id}>{item.alt || item.filename}</option>)}</select></label>
            {post.coverUrl && <div className="sm:col-span-2"><Image src={post.coverUrl} alt={post.coverAlt || "Ảnh bìa đang chọn"} width={960} height={540} unoptimized className="max-h-56 w-full rounded-xl border border-[#eaecf0] object-cover" /><label className={`${labelClass} mt-4`}>Văn bản thay thế ảnh<input value={post.coverAlt} onChange={(event) => update("coverAlt", event.target.value)} className={inputClass} /></label></div>}
            <label className={`${labelClass} sm:col-span-2`}>Nội dung<textarea required rows={18} value={post.content} onChange={(event) => update("content", event.target.value)} className={`${inputClass} min-h-[320px] resize-y leading-6`} placeholder="Mỗi đoạn cách nhau một dòng trống. Nội dung sẽ hiển thị theo các đoạn văn trên blog." /><span className="mt-1.5 block font-normal text-[#98a2b3]">Trình soạn thảo văn bản thuần; xuống dòng đôi để bắt đầu đoạn mới.</span></label>
            <div className="sm:col-span-2 rounded-xl border border-[#eaecf0] bg-[#fcfcfd] p-4 sm:p-5">
              <h3 className="text-sm font-bold text-[#344054]">SEO và chia sẻ</h3>
              <p className="mt-1 text-xs leading-5 text-[#98a2b3]">Để trống tiêu đề và mô tả để dùng tiêu đề, mô tả ngắn của bài viết.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>SEO title<input maxLength={70} value={post.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} className={inputClass} placeholder="Tối đa 70 ký tự" /></label>
                <label className={labelClass}>Canonical URL<input value={post.seoCanonicalUrl} onChange={(event) => update("seoCanonicalUrl", event.target.value)} className={inputClass} placeholder="https://domain.vn/blog/duong-dan" /></label>
                <label className={`${labelClass} sm:col-span-2`}>SEO description<textarea rows={2} maxLength={180} value={post.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} className={`${inputClass} resize-y`} placeholder="Mô tả dùng khi chia sẻ và lập chỉ mục" /></label>
                <label className={`${labelClass} sm:col-span-2`}>Ảnh chia sẻ<select value={post.seoImageId} onChange={(event) => { const selected = data.media.find((item) => item.id === event.target.value); setPost((current) => ({ ...current, seoImageId: event.target.value, seoImageUrl: selected?.url || "" })); }} className={inputClass}><option value="">Dùng ảnh bìa</option>{data.media.map((item) => <option key={item.id} value={item.id}>{item.alt || item.filename}</option>)}</select></label>
                {post.seoImageUrl && <div className="sm:col-span-2"><Image src={post.seoImageUrl} alt="Ảnh chia sẻ đang chọn" width={960} height={540} unoptimized className="max-h-48 w-full rounded-xl border border-[#eaecf0] object-cover" /></div>}
                <label className="flex items-center gap-2 text-xs font-semibold text-[#475467] sm:col-span-2"><input type="checkbox" checked={post.seoNoIndex} onChange={(event) => setPost((current) => ({ ...current, seoNoIndex: event.target.checked }))} className="size-4 accent-[#ff4164]" />Không cho công cụ tìm kiếm lập chỉ mục bài viết này</label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f1f5] pt-5">
            {post.id ? <button type="button" disabled={busy} onClick={() => void removePost()} className="rounded-xl px-3 py-2 text-sm font-semibold text-[#b42318] hover:bg-[#fff3f2] disabled:opacity-50">Xóa bài viết</button> : <span />}
            <button disabled={busy} type="submit" className="rounded-xl bg-[#ff4164] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ee3155] disabled:opacity-50">{busy ? "Đang lưu…" : post.status === "published" ? "Lưu và xuất bản" : "Lưu bản nháp"}</button>
          </div>
        </AdminPanel>
      </form>
    </div>}
  </div>;
}

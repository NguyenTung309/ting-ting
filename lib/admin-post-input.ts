import { plainTextToLexical, slugifyAdminTitle } from "@/lib/admin-content";

export function parseAdminPostData(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 500) : "";
  const content = typeof body.content === "string" ? body.content.trim().slice(0, 100_000) : "";
  const requestedSlug = typeof body.slug === "string" ? body.slug : "";
  const slug = slugifyAdminTitle(requestedSlug || title).slice(0, 180);
  const status = body.status === "published" ? "published" : "draft";
  const tagsSource = typeof body.tagsText === "string" ? body.tagsText : "";
  const tags = [...new Set(tagsSource.split(/[,;\n]/).map((tag) => tag.trim()).filter(Boolean))].slice(0, 30).map((tag) => tag.slice(0, 60));
  if (!title || !excerpt || !content || !slug) return { error: "Vui lòng nhập tiêu đề, đường dẫn, mô tả và nội dung bài viết." } as const;
  const data: Record<string, unknown> = { title, slug, excerpt, content: plainTextToLexical(content), tags, _status: status };
  if (typeof body.categoryId === "string") data.category = body.categoryId ? Number(body.categoryId) || body.categoryId : null;
  if (typeof body.coverId === "string") data.cover = body.coverId ? Number(body.coverId) || body.coverId : null;
  if (typeof body.coverAlt === "string") data.coverAlt = body.coverAlt.trim().slice(0, 300);
  const seo: Record<string, unknown> = {};
  if (typeof body.seoTitle === "string") seo.title = body.seoTitle.trim().slice(0, 70);
  if (typeof body.seoDescription === "string") seo.description = body.seoDescription.trim().slice(0, 180);
  if (typeof body.seoImageId === "string") seo.image = body.seoImageId ? Number(body.seoImageId) || body.seoImageId : null;
  if (typeof body.seoCanonicalUrl === "string") seo.canonicalUrl = body.seoCanonicalUrl.trim().slice(0, 500);
  if (typeof body.seoNoIndex === "boolean") seo.noIndex = body.seoNoIndex;
  if (Object.keys(seo).length) data.seo = seo;
  if (typeof body.publishedAt === "string" && body.publishedAt.trim()) {
    const date = new Date(body.publishedAt);
    if (Number.isNaN(date.getTime())) return { error: "Ngày xuất bản không hợp lệ." } as const;
    data.publishedAt = date.toISOString();
  }
  return { data } as const;
}

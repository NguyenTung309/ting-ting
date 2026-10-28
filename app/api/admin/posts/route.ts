import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { adminPostSummary, getAdminPayload } from "@/lib/admin-content";
import { parseAdminPostData } from "@/lib/admin-post-input";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    const payload = await getAdminPayload();
    const [posts, categories, media] = await Promise.all([
      payload.find({ collection: "posts", sort: "-updatedAt", limit: 100, depth: 1, draft: true, overrideAccess: true }),
      payload.find({ collection: "categories", sort: "title", limit: 100, overrideAccess: true }),
      payload.find({ collection: "media", sort: "-updatedAt", limit: 100, overrideAccess: true }),
    ]);
    return NextResponse.json({
      posts: posts.docs.map((post) => adminPostSummary(post as unknown as Record<string, unknown>)),
      total: posts.totalDocs,
      categories: categories.docs.map((category) => ({ id: String(category.id), title: String(category.title) })),
      media: media.docs.map((item) => ({ id: String(item.id), url: String(item.url || ""), alt: String(item.alt || ""), filename: String(item.filename || "") })),
    });
  } catch {
    return NextResponse.json({ error: "Không tải được nội dung blog." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 }); }
  const parsed = parseAdminPostData(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const payload = await getAdminPayload();
    const post = await payload.create({ collection: "posts", data: parsed.data, depth: 1, draft: true, overrideAccess: true });
    return NextResponse.json({ post: adminPostSummary(post as unknown as Record<string, unknown>) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không lưu được bài viết. Hãy kiểm tra slug đã được dùng chưa." }, { status: 400 });
  }
}

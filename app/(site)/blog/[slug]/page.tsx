import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RichTextContent } from "@/components/content/RichTextContent";
import { Container } from "@/components/site/Container";
import { getPublishedPost, getPublishedPosts } from "@/lib/content";
import { absoluteUrl, canonicalUrl, serializeJsonLd, siteMetadata } from "@/lib/seo";

type Args = { params: Promise<{ slug: string }> };

export const revalidate = 60;

function validDate(value?: string): string | undefined {
  if (!value || Number.isNaN(new Date(value).getTime())) return undefined;
  return new Date(value).toISOString();
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.filter((post) => !post.seoNoIndex).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết", robots: { index: false, follow: true } };

  return siteMetadata({
    path: `/blog/${encodeURIComponent(post.slug)}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.tags,
    image: post.seoImageUrl || post.coverUrl,
    canonicalOverride: post.seoCanonicalUrl,
    indexable: !post.seoNoIndex,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: Args) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const pageUrl = canonicalUrl(`/blog/${encodeURIComponent(post.slug)}`, post.seoCanonicalUrl);
  const datePublished = validDate(post.publishedAt);
  const dateModified = validDate(post.updatedAt);
  const breadcrumbs = [
    { name: "Trang chủ", item: canonicalUrl("/") },
    { name: "Góc chia sẻ", item: canonicalUrl("/blog") },
    { name: post.title, item: pageUrl },
  ];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    headline: post.title,
    description: post.excerpt,
    keywords: post.tags?.length ? post.tags : undefined,
    inLanguage: "vi-VN",
    ...(post.coverUrl ? { image: [absoluteUrl(post.coverUrl)] } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
  const posts = await getPublishedPosts();
  const relatedPosts = post.relatedPosts?.length
    ? post.relatedPosts
    : posts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 2);

  return (
    <Container className="py-12 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Đường dẫn" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-brand">Trang chủ</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-brand">Góc chia sẻ</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-brand-dark">{post.title}</li>
          </ol>
        </nav>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-brand">{post.category || "Góc chia sẻ"}</p>
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.06em] text-brand-dark sm:text-6xl">{post.title}</h1>
        <p className="mt-6 text-xl leading-8 text-muted">{post.excerpt}</p>
        {datePublished ? <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <time dateTime={datePublished}>Đăng ngày {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(datePublished))}</time>
          {dateModified && dateModified !== datePublished ? <time dateTime={dateModified}>Cập nhật ngày {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(dateModified))}</time> : null}
        </div> : null}
        {post.coverUrl ? <Image className="mt-10 h-auto w-full rounded-3xl" src={post.coverUrl} alt={post.coverAlt || post.title} width={1200} height={675} unoptimized priority /> : null}
        <div className="mt-12 border-t border-line pt-8">
          {post.html
            ? <div className="rich-text" dangerouslySetInnerHTML={{ __html: post.html }} />
            : <RichTextContent value={post.body} />}
        </div>
        <div className="mt-12 grid gap-4 rounded-3xl bg-[#fff5ee] p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="font-bold text-brand-dark">Khám phá xu hướng tài chính</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Tìm hiểu các cách nhìn khác nhau về tiền bạc trong một mối quan hệ.</p>
            <Link className="mt-3 inline-block text-sm font-bold text-brand underline" href="/kho-tang-tinh-cach">Xem kho xu hướng</Link>
          </div>
          <div>
            <h2 className="font-bold text-brand-dark">Bắt đầu từ câu chuyện của bạn</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Bài test là một gợi ý để bạn nhìn lại ưu tiên tài chính của mình.</p>
            <Link className="mt-3 inline-block text-sm font-bold text-brand underline" href="/test-xu-huong-tai-chinh">Làm test xu hướng</Link>
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      </article>
      {relatedPosts.length ? <section className="mx-auto mt-16 max-w-5xl border-t border-line pt-10" aria-labelledby="related-posts">
        <h2 id="related-posts" className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Bài viết liên quan</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">{relatedPosts.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-[2rem] border border-line bg-white/70 p-5 transition hover:-translate-y-1">
          <p className="text-sm font-bold text-brand-dark">{item.title}</p><p className="mt-2 text-sm leading-6 text-muted">{item.excerpt}</p>
        </Link>)}</div>
      </section> : null}
    </Container>
  );
}

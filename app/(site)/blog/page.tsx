import Image from "next/image";
import Link from "next/link";

import { getPublishedPosts } from "@/lib/content";
import { LibraryCarousel } from "@/components/site/LibraryCarousel";
import { siteMetadata } from "@/lib/seo";

export const revalidate = 60;

const baseMetadata = siteMetadata({
  path: "/blog",
  title: "Góc chia sẻ về tiền bạc và tình yêu",
  description: "Những bài viết ngắn về tiền bạc, kết nối và cách mình nhìn lại chính mình.",
});

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return category ? { ...baseMetadata, alternates: undefined, robots: { index: false, follow: true } } : baseMetadata;
}

const articleImages = [
  "/figma-assets/design/d0c97.png",
  "/figma-assets/design/66abf.png",
  "/figma-assets/design/b569d.png",
  "/figma-assets/design/66abf.png",
];

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const posts = await getPublishedPosts();
  const { category } = await searchParams;
  const filteredPosts = category ? posts.filter((post) => post.category === category) : posts;
  const [featured, ...articles] = filteredPosts;

  return (
    <div className="ttt-blog-page figma-blog-page">
      <section className="ttt-blog-library" id="thu-vien" aria-labelledby="ttt-blog-library-title">
        <div className="ttt-blog-library-inner">
          <h2 id="ttt-blog-library-title">Thư viện</h2>
          <LibraryCarousel />
          <Link href="/kho-tang-tinh-cach" className="ttt-blog-library-more">Xem thêm</Link>
        </div>
      </section>

      <div className="ttt-blog-inner" id="blog">
        <h1 className="ttt-blog-title">Góc chia sẻ</h1>
        {featured ? <>
          <article className="ttt-blog-feature" id="bai-noi-bat">
            <Link href={`/blog/${featured.slug}`} className="ttt-blog-feature-art" aria-label={`Đọc bài: ${featured.title}`}>
              <Image src={featured.coverUrl || "/figma-assets/design/dca23.png"} alt={featured.coverAlt || featured.title} width={815} height={310} sizes="(max-width: 900px) calc(100vw - 48px), (max-width: 1279px) 62vw, 815px" unoptimized={Boolean(featured.coverUrl)} quality={95} />
            </Link>
            <div className="ttt-blog-feature-copy">
              {featured.category ? <Link className="ttt-blog-tag" href={`/blog?category=${encodeURIComponent(featured.category)}`}>{featured.category}</Link> : null}
              <h2><Link href={`/blog/${featured.slug}`}>{featured.title}</Link></h2>
              <p>{featured.excerpt}</p>
              <Link className="ttt-blog-read-more" href={`/blog/${featured.slug}`}>Đọc tiếp</Link>
            </div>
          </article>
          <div className="ttt-blog-grid" id="bai-viet">
            {articles.map((post, index) => <article key={post.slug} className="ttt-blog-card" data-index={index % 4}>
              <Link href={`/blog/${post.slug}`} className="ttt-blog-card-art" aria-label={`Đọc bài: ${post.title}`}>
                <Image src={post.coverUrl || articleImages[index % articleImages.length]} alt={post.coverAlt || (post.coverUrl ? post.title : "")} width={392} height={208} sizes="(max-width: 767px) calc((100vw - 76px) / 2), (max-width: 1199px) 44vw, 286px" unoptimized={Boolean(post.coverUrl)} quality={95} />
              </Link>
              {post.category ? <Link className="ttt-blog-tag" href={`/blog?category=${encodeURIComponent(post.category)}`}>{post.category}</Link> : null}
              <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
              <p>{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="ttt-blog-read-more">Đọc tiếp</Link>
            </article>)}
          </div>
        </> : <p className="ttt-blog-empty">{category ? "Chưa có bài viết trong nhóm này." : "Các câu chuyện đang được chuẩn bị. Hãy ghé lại sớm nhé."}</p>}
      </div>
    </div>
  );
}

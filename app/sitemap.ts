import type { MetadataRoute } from "next";

import { getAllPublishedPosts } from "@/lib/content";
import { canonicalUrl, SITE_URL } from "@/lib/seo";
import { getAllPublishedTrends } from "@/lib/trends/data";

export const dynamic = "force-dynamic";

const staticPaths = [
  "/",
  "/ve-du-an",
  "/blog",
  "/kho-tang-tinh-cach",
  "/test-xu-huong-tai-chinh",
  "/card",
];

function validDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, trends] = await Promise.all([getAllPublishedPosts(), getAllPublishedTrends()]);
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const add = (entry: MetadataRoute.Sitemap[number]) => {
    const parsedUrl = new URL(entry.url, SITE_URL);
    const url = parsedUrl.pathname === "/" ? parsedUrl.origin : parsedUrl.href;
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ ...entry, url });
  };

  for (const path of staticPaths) add({ url: canonicalUrl(path) });

  for (const post of posts) {
    if (post.seoNoIndex) continue;
    const path = "/blog/" + encodeURIComponent(post.slug);
    const selfUrl = canonicalUrl(path);
    const postCanonical = canonicalUrl(path, post.seoCanonicalUrl);
    if (postCanonical !== selfUrl) continue;
    const lastModified = validDate(post.updatedAt) || validDate(post.publishedAt);
    add({ url: postCanonical, ...(lastModified ? { lastModified } : {}) });
  }

  for (const trend of trends) {
    if (trend.status !== "published") continue;
    const path = "/kho-tang-tinh-cach/" + encodeURIComponent(trend.slug);
    const lastModified = validDate(trend.updatedAt);
    add({ url: canonicalUrl(path), ...(lastModified ? { lastModified } : {}) });
  }

  return entries;
}

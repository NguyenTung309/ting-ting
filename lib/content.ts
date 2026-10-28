import "server-only";

import sanitizeHtml from "sanitize-html";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { getPayload } from "payload";

import config from "@payload-config";
import type { PublicPost } from "./content-fallback";
import { fallbackPosts } from "./content-fallback";
export type { PublicPost } from "./content-fallback";

type CmsMedia = { url?: string | null; alt?: string | null };
type CmsCategory = { title?: string | null };
type CmsPost = Record<string, unknown> & {
  title?: string;
  slug?: string;
  excerpt?: string;
  tags?: unknown;
  content?: unknown;
  category?: CmsCategory | string | null;
  cover?: CmsMedia | string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: CmsMedia | string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean | null;
  } | null;
};

const allowedHtml = {
  allowedTags: Array.from(new Set([
    ...sanitizeHtml.defaults.allowedTags,
    "figure", "figcaption", "picture", "source", "iframe", "video", "audio", "hgroup",
    "mark", "div", "span", "section", "article", "details", "summary", "table", "thead",
    "tbody", "tr", "th", "td", "hr",
  ])),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "id", "aria-label"],
    a: ["href", "name", "target", "rel"],
    img: ["src", "srcset", "alt", "width", "height", "loading", "sizes"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title", "loading", "referrerpolicy"],
    video: ["src", "controls", "width", "height", "poster", "preload"],
    source: ["src", "srcset", "type", "media"],
    audio: ["src", "controls", "preload"],
    ol: ["start", "reversed", "type"],
    li: ["value"],
    th: ["scope", "colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "open.spotify.com"],
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

let payloadPromise: ReturnType<typeof getPayload> | undefined;
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

function getCms() {
  payloadPromise ??= getPayload({ config }).catch((error: unknown) => {
    payloadPromise = undefined;
    throw error;
  });
  return payloadPromise;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function mediaUrl(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  return text((value as CmsMedia).url);
}

function mapPost(post: CmsPost): PublicPost {
  const coverUrl = mediaUrl(post.cover);
  const body = post.content ?? null;
  let html: string | undefined;

  if (body && typeof body === "object") {
    try {
      html = sanitizeHtml(convertLexicalToHTML({
        data: body as Parameters<typeof convertLexicalToHTML>[0]["data"],
      }), allowedHtml);
    } catch {
      html = undefined;
    }
  }

  return {
    title: text(post.title) || "",
    slug: text(post.slug) || "",
    excerpt: text(post.excerpt) || "",
    publishedAt: text(post.publishedAt),
    updatedAt: text(post.updatedAt),
    category: typeof post.category === "object" && post.category ? text(post.category.title) : undefined,
    tags: Array.isArray(post.tags) ? post.tags.filter((tag: unknown): tag is string => typeof tag === "string" && Boolean(tag.trim())).map((tag: string) => tag.trim()) : [],
    body,
    html,
    coverUrl,
    coverAlt: text(post.coverAlt) || (typeof post.cover === "object" && post.cover ? text(post.cover.alt) : undefined),
    seoTitle: text(post.seo?.title),
    seoDescription: text(post.seo?.description),
    seoImageUrl: mediaUrl(post.seo?.image) || coverUrl,
    seoCanonicalUrl: text(post.seo?.canonicalUrl),
    seoNoIndex: Boolean(post.seo?.noIndex),
    relatedPosts: Array.isArray(post.relatedPosts)
      ? post.relatedPosts.flatMap((related: unknown) => {
        if (!related || typeof related !== "object") return [];
        const item = related as CmsPost;
        return text(item.slug) && text(item.title)
          ? [{ title: item.title as string, slug: item.slug as string, excerpt: text(item.excerpt) || "" }]
          : [];
      })
      : undefined,
  };
}

function fallbackOr(posts: PublicPost[]): PublicPost[] {
  return posts.length ? posts : fallbackPosts;
}

async function findPage(page: number) {
  const payload = await getCms();
  return payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    page,
    limit: 100,
    depth: 1,
    draft: false,
    overrideAccess: false,
  });
}

export async function getPublishedPosts(): Promise<PublicPost[]> {
  if (isProductionBuild) return fallbackPosts;
  try {
    const result = await findPage(1);
    return fallbackOr(result.docs.map((post) => mapPost(post as unknown as CmsPost)));
  } catch {
    return fallbackPosts;
  }
}

export async function getAllPublishedPosts(): Promise<PublicPost[]> {
  if (isProductionBuild) return fallbackPosts;
  const posts: PublicPost[] = [];
  try {
    for (let page = 1; ; page += 1) {
      const result = await findPage(page);
      posts.push(...result.docs.map((post) => mapPost(post as unknown as CmsPost)));
      if (!result.hasNextPage) return fallbackOr(posts);
    }
  } catch {
    return fallbackOr(posts);
  }
}

export async function getPublishedPost(slug: string): Promise<PublicPost | null> {
  if (isProductionBuild) return fallbackPosts.find((item) => item.slug === slug) ?? null;
  try {
    const payload = await getCms();
    const result = await payload.find({
      collection: "posts",
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: "published" } },
        ],
      },
      limit: 1,
      depth: 1,
      draft: false,
      overrideAccess: false,
    });
    if (result.docs[0]) return mapPost(result.docs[0] as unknown as CmsPost);
    return fallbackPosts.find((item) => item.slug === slug) ?? null;
  } catch {
    return fallbackPosts.find((item) => item.slug === slug) ?? null;
  }
}

export async function checkPayloadCms(): Promise<boolean> {
  try {
    const payload = await getCms();
    await payload.find({ collection: "posts", limit: 1, overrideAccess: true });
    return true;
  } catch {
    return false;
  }
}

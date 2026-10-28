import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";

let payloadPromise: ReturnType<typeof getPayload> | undefined;

export function getAdminPayload() {
  payloadPromise ??= getPayload({ config }).catch((error: unknown) => {
    payloadPromise = undefined;
    throw error;
  });
  return payloadPromise;
}

export function slugifyAdminTitle(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function collectText(value: unknown, output: string[]) {
  if (!value || typeof value !== "object") return;
  const node = value as Record<string, unknown>;
  if (node.type === "text" && typeof node.text === "string") output.push(node.text);
  if (node.type === "linebreak") output.push("\n");
  if (Array.isArray(node.children)) {
    const children = node.children as unknown[];
    for (const child of children) collectText(child, output);
    if (node.type === "paragraph" || node.type === "heading" || node.type === "listitem") output.push("\n");
  }
}

export function lexicalToPlainText(value: unknown) {
  const lines: string[] = [];
  collectText(value, lines);
  return lines.join("").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function plainTextToLexical(value: string) {
  const paragraphs = value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return {
    root: {
      type: "root", format: "", indent: 0, version: 1, direction: "ltr",
      children: (paragraphs.length ? paragraphs : [""]).map((paragraph) => ({
        type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr",
        children: paragraph.split("\n").flatMap((line, index) => [
          ...(index ? [{ type: "linebreak", version: 1 }] : []),
          ...(line ? [{ type: "text", text: line, detail: 0, format: 0, mode: "normal", style: "", version: 1 }] : []),
        ]),
      })),
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function valueText(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function adminPostSummary(post: Record<string, unknown>) {
  const cover = asRecord(post.cover);
  const seo = asRecord(post.seo);
  const seoImage = asRecord(seo?.image);
  const category = asRecord(post.category);
  return {
    id: String(post.id),
    title: valueText(post.title),
    slug: valueText(post.slug),
    excerpt: valueText(post.excerpt),
    content: lexicalToPlainText(post.content),
    status: post._status === "published" ? "published" : "draft",
    category: valueText(category?.title),
    categoryId: category?.id ? String(category.id) : "",
    coverId: cover?.id ? String(cover.id) : "",
    coverUrl: valueText(cover?.url),
    coverAlt: valueText(post.coverAlt || cover?.alt),
    tagsText: Array.isArray(post.tags) ? post.tags.map(String).join(", ") : "",
    seoTitle: valueText(seo?.title),
    seoDescription: valueText(seo?.description),
    seoImageId: seoImage?.id ? String(seoImage.id) : "",
    seoImageUrl: valueText(seoImage?.url),
    seoCanonicalUrl: valueText(seo?.canonicalUrl),
    seoNoIndex: Boolean(seo?.noIndex),
    publishedAt: post.publishedAt || "",
    updatedAt: valueText(post.updatedAt),
  };
}

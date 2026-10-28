import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPayload } from "payload";

import config from "../payload.config";

type LegacyPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  paragraphs: string[];
};

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const source = JSON.parse(readFileSync(path.resolve(dirname, "../migrations/payload/legacy-posts.json"), "utf8")) as { posts: LegacyPost[] };
const payload = await getPayload({ config });
let imported = 0;
let skipped = 0;

function lexicalDocument(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      version: 1,
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        version: 1,
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        children: [{
          type: "text",
          version: 1,
          text,
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
        }],
      })),
    },
  };
}

try {
  for (const post of source.posts) {
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: post.slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    if (existing.docs[0]) {
      skipped += 1;
      continue;
    }

    const category = await payload.find({
      collection: "categories",
      where: { slug: { equals: post.category.toLowerCase().replace(/\s+/g, "-") } },
      limit: 1,
      overrideAccess: true,
    });
    const categoryId = category.docs[0]?.id ?? (await payload.create({
      collection: "categories",
      data: {
        title: post.category,
        slug: post.category.toLowerCase().replace(/\s+/g, "-"),
      },
      overrideAccess: true,
    })).id;

    await payload.create({
      collection: "posts",
      draft: false,
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: lexicalDocument(post.paragraphs),
        category: categoryId,
        publishedAt: post.publishedAt,
        _status: "published",
        seo: { noIndex: false },
      },
      overrideAccess: true,
    });
    imported += 1;
  }
} finally {
  await payload.destroy();
}

console.log(`Payload import complete: ${imported} imported, ${skipped} already present.`);

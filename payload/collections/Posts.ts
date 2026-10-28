import type { Access, CollectionConfig } from "payload";

const authenticated: Access = ({ req }) => Boolean(req.user);

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateCanonical(value: unknown): true | string {
  if (typeof value !== "string" || !value.trim()) return true;
  try {
    const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tinhtinhtingting.com").origin;
    const canonical = new URL(value, siteOrigin);
    return canonical.origin === siteOrigin
      ? true
      : "Canonical phải thuộc domain của website.";
  } catch {
    return "Canonical cần là URL hợp lệ.";
  }
}

export const Posts: CollectionConfig = {
  slug: "posts",
  dbName: "ttt_payload_posts",
  lockDocuments: false,
  admin: {
    useAsTitle: "title",
    group: "Nội dung",
    defaultColumns: ["title", "category", "_status", "publishedAt", "updatedAt"],
    listSearchableFields: ["title", "slug", "excerpt"],
  },
  access: {
    read: ({ req }) => req.user ? true : { _status: { equals: "published" } },
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: {
    drafts: { autosave: { interval: 5_000 } },
    maxPerDoc: 50,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data.slug) data.slug = slugify(data.title);
        return data;
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data?._status === "published" && !data.publishedAt) data.publishedAt = new Date().toISOString();
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true, label: "Tiêu đề" },
    { name: "slug", type: "text", required: true, unique: true, index: true, label: "Đường dẫn" },
    { name: "excerpt", type: "textarea", required: true, label: "Mô tả ngắn" },
    { name: "content", type: "richText", required: true, label: "Nội dung bài viết" },
    { name: "tags", type: "json", defaultValue: [], label: "Thẻ nội dung" },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      label: "Chuyên mục",
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Ảnh bìa",
    },
    { name: "coverAlt", type: "text", label: "Mô tả ảnh bìa" },
    {
      name: "publishedAt",
      type: "date",
      label: "Ngày xuất bản",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO và chia sẻ",
      fields: [
        { name: "title", type: "text", label: "SEO title", maxLength: 70 },
        { name: "description", type: "textarea", label: "SEO description", maxLength: 180 },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Ảnh chia sẻ",
        },
        {
          name: "canonicalUrl",
          type: "text",
          label: "Canonical URL",
          validate: validateCanonical,
        },
        {
          name: "noIndex",
          type: "checkbox",
          label: "Không cho lập chỉ mục",
          defaultValue: false,
        },
      ],
    },
    {
      name: "relatedPosts",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      label: "Bài viết liên quan",
    },
  ],
};

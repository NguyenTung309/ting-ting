import type { Access, CollectionConfig } from "payload";

const authenticated: Access = ({ req }) => Boolean(req.user);

export const Categories: CollectionConfig = {
  slug: "categories",
  dbName: "ttt_payload_categories",
  lockDocuments: false,
  admin: {
    useAsTitle: "title",
    group: "Nội dung",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: "title", type: "text", required: true, label: "Tên chuyên mục" },
    { name: "slug", type: "text", required: true, unique: true, index: true, label: "Đường dẫn" },
  ],
  timestamps: true,
};

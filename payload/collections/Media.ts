import path from "node:path";

import type { Access, CollectionConfig } from "payload";

const authenticated: Access = ({ req }) => Boolean(req.user);

export const Media: CollectionConfig = {
  slug: "media",
  dbName: "ttt_payload_media",
  lockDocuments: false,
  upload: {
    staticDir: path.resolve(process.cwd(), "public/media"),
    mimeTypes: ["image/*"],
  },
  admin: {
    useAsTitle: "filename",
    group: "Nội dung",
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: "alt", type: "text", required: true, label: "Văn bản thay thế" },
  ],
};

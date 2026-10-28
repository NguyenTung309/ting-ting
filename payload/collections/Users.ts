import type { Access, CollectionConfig } from "payload";

const authenticated: Access = ({ req }) => Boolean(req.user);

export const Users: CollectionConfig = {
  slug: "users",
  dbName: "ttt_payload_users",
  lockDocuments: false,
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Quản trị",
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "displayName",
      type: "text",
      label: "Tên hiển thị",
    },
  ],
  versions: false,
};

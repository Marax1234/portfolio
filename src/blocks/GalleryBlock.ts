import type { Block } from "payload";

/** Galerie-Block (Sprint 6) — mehrere Bilder im Raster innerhalb eines Beitrags. */
export const GalleryBlock: Block = {
  slug: "gallery",
  interfaceName: "GalleryBlock",
  labels: {
    singular: "Galerie",
    plural: "Galerien",
  },
  fields: [
    {
      name: "images",
      type: "array",
      required: true,
      minRows: 2,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
  ],
};

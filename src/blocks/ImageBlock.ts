import type { Block } from "payload";

/**
 * Vollbild-Bild-Block (Sprint 6) — Bilder/Video-Loops in voller Breite
 * eingestreut (Konzept §4.4).
 */
export const ImageBlock: Block = {
  slug: "image",
  interfaceName: "ImageBlock",
  labels: {
    singular: "Vollbild-Bild",
    plural: "Vollbild-Bilder",
  },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
  ],
};

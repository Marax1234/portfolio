import type { CollectionConfig } from "payload";

/**
 * Media — Datenmodell für die Medien-Abstraktion (Sprint 1: src/lib/media/).
 *
 * PLATZHALTER: Schreibt lokal nach `media/` (staticDir). Sprint 7 ersetzt
 * dies durch das S3-/Object-Storage-Plugin — Collection-Schema und
 * Feldnamen bleiben dabei stabil, nur der Storage-Adapter wechselt.
 *
 * `imageSizes` ist bereits für responsive Bildvarianten vorbereitet
 * (siehe Sprint 7), wird in Sprint 4 aber noch nicht im Frontend genutzt.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Medien",
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/*"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "hero", width: 1600, height: 900, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt-Text",
      admin: {
        description: "Beschreibender Alt-Text — Pflichtfeld für Barrierefreiheit.",
      },
    },
  ],
};

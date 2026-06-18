import type { CollectionConfig } from "payload";

import { revalidateMedia, revalidateMediaDelete } from "../hooks/revalidate";

/**
 * Media — Datenmodell für die Medien-Abstraktion (Sprint 1: src/lib/media/).
 *
 * Uploads landen seit Sprint 7 im Object Storage (MinIO lokal, siehe
 * docker-compose.dev.yml) statt im lokalen `staticDir` — der S3-Storage-
 * Adapter wird in `payload.config.ts` (`plugins: [s3Storage(...)]`)
 * registriert und setzt `disableLocalStorage` automatisch. Collection-
 * Schema und Feldnamen bleiben dabei stabil (`staticDir` ist nur noch der
 * lokale Schema-Defaultwert, wird zur Laufzeit nicht mehr beschrieben).
 *
 * `imageSizes` erzeugt die responsiven Bildvarianten, die das S3-Plugin
 * zusammen mit dem Original in den Bucket schreibt.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Medien",
  },
  hooks: {
    afterChange: [revalidateMedia],
    afterDelete: [revalidateMediaDelete],
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

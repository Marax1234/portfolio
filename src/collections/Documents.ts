import type { CollectionConfig } from "payload";

/**
 * Documents — Upload-Collection fuer Dateien (Sprint 9: Media-Kit).
 *
 * Bewusst getrennt von `Media` (dort: image/*, video/*) — hier
 * ausschliesslich PDFs. Kein `imageSizes` → Sharp verarbeitet nichts.
 *
 * Uploads landen im Object Storage (S3-Plugin in payload.config.ts,
 * Prefix "documents/"). Oeffentliche URL ueber `generateFileURL`.
 */
export const Documents: CollectionConfig = {
  slug: "documents",
  labels: {
    singular: "Dokument",
    plural: "Dokumente",
  },
  admin: {
    group: "Medien",
    useAsTitle: "filename",
    description: "PDF-Dokumente, z.B. Media-Kit. Getrennt von Bildern/Videos.",
  },
  upload: {
    staticDir: "documents",
    mimeTypes: ["application/pdf"],
    // Keine imageSizes — kein Bild-Processing durch Sharp
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Beschreibung",
      admin: {
        description: "Kurze Beschreibung des Dokuments (z.B. 'Media-Kit 2024').",
      },
    },
  ],
};

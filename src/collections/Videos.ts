import type { CollectionConfig } from "payload";

import { revalidateVideos, revalidateVideosDelete } from "../hooks/revalidate";
import { triggerTranscode } from "../lib/video/transcode";

/**
 * Videos — Upload-Collection für Video-Dateien (Sprint 8).
 *
 * Getrennt von der bild-orientierten `media`-Collection:
 * - Kein `imageSizes` (keine Raster-Varianten für Videos).
 * - Eigene HLS-Felder: `hlsUrl`, `posterUrl`, `status`, Dimensionen/Dauer.
 * - Das S3-Storage-Plugin wird in `payload.config.ts` für diese Collection
 *   registriert → Originale landen unter `videos/<file>` im Bucket.
 * - Nach dem Upload startet ein asynchroner Transkodierungs-Job (FFmpeg in
 *   Docker → HLS-Ladder 1080/720/480p + Poster-Frame → Segmente + Master-
 *   Playlist in Object Storage). `status` wechselt von `processing` → `ready`.
 */
export const Videos: CollectionConfig = {
  slug: "videos",
  labels: {
    singular: "Video",
    plural: "Videos",
  },
  admin: {
    group: "Medien",
    defaultColumns: ["title", "status", "updatedAt"],
    useAsTitle: "title",
    description:
      "Videos werden nach dem Upload automatisch für HLS transkodiert (benötigt Docker). Status wechselt von 'Verarbeitung' → 'Bereit' nach Abschluss.",
  },
  hooks: {
    afterChange: [revalidateVideos, triggerTranscode],
    afterDelete: [revalidateVideosDelete],
  },
  upload: {
    staticDir: "videos",
    mimeTypes: ["video/*"],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Titel",
      admin: { description: "Interner Name (wird nicht im Frontend angezeigt)." },
    },
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt-Text / Beschreibung",
      admin: {
        description: "Barrierefreiheit — beschreibt den Videoinhalt.",
      },
    },
    {
      name: "status",
      type: "select",
      label: "Transkodierungs-Status",
      defaultValue: "processing",
      options: [
        { label: "Verarbeitung …", value: "processing" },
        { label: "Bereit", value: "ready" },
        { label: "Fehler", value: "error" },
      ],
      admin: {
        readOnly: true,
        description: "Wird automatisch nach der FFmpeg-Transkodierung gesetzt.",
      },
    },
    {
      name: "hlsUrl",
      type: "text",
      label: "HLS-Master-Playlist-URL",
      admin: {
        readOnly: true,
        description: "Automatisch gesetzt nach Transkodierung.",
      },
    },
    {
      name: "posterUrl",
      type: "text",
      label: "Poster-Frame-URL",
      admin: {
        readOnly: true,
        description: "Automatisch extrahierter Poster-Frame.",
      },
    },
    {
      name: "width",
      type: "number",
      label: "Breite (px)",
      admin: { readOnly: true },
    },
    {
      name: "height",
      type: "number",
      label: "Höhe (px)",
      admin: { readOnly: true },
    },
    {
      name: "duration",
      type: "number",
      label: "Dauer (s)",
      admin: { readOnly: true },
    },
  ],
};

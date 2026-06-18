import type { Block } from "payload";

/**
 * Video-Block (Sprint 6) — definierter Slot für die echte HLS-Wiedergabe
 * (Sprint 8). Bis dahin rendert das Frontend nur das Standbild (`poster`).
 */
export const VideoBlock: Block = {
  slug: "video",
  interfaceName: "VideoBlock",
  labels: {
    singular: "Video",
    plural: "Videos",
  },
  fields: [
    {
      name: "video",
      type: "upload",
      relationTo: "videos",
      label: "Video (HLS)",
      admin: {
        description:
          "Video aus der Videos-Collection (status muss 'Bereit' sein). Wird als HLS-Loop abgespielt.",
      },
    },
    {
      name: "poster",
      type: "upload",
      relationTo: "media",
      label: "Standbild / Poster-Fallback",
      admin: {
        description:
          "Wird angezeigt, wenn kein Video gesetzt ist oder während das Video lädt.",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Bildunterschrift",
    },
  ],
};

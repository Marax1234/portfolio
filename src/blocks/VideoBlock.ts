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
      name: "poster",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Standbild",
      admin: {
        description: "Platzhalter bis Sprint 8 (HLS-Wiedergabe) — bis dahin nur Standbild.",
      },
    },
    {
      name: "caption",
      type: "text",
    },
  ],
};

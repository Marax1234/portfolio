import type { Block } from "payload";

/** Zwei-Spalten-Block (Sprint 6) — zwei Bilder nebeneinander (Vergleich/Paar-Motiv). */
export const TwoColumnBlock: Block = {
  slug: "twoColumn",
  interfaceName: "TwoColumnBlock",
  labels: {
    singular: "Zwei-Spalten",
    plural: "Zwei-Spalten-Blöcke",
  },
  fields: [
    {
      name: "left",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "leftCaption",
      type: "text",
      label: "Bildunterschrift (links)",
    },
    {
      name: "right",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "rightCaption",
      type: "text",
      label: "Bildunterschrift (rechts)",
    },
  ],
};

import type { Block } from "payload";

/**
 * Text-Block (Sprint 6) — schmale Lesespalte im Journal-Beitrag
 * (Konzept §4.4: „lesbarer Longread, schmale Textspalte für Lesbarkeit").
 */
export const TextBlock: Block = {
  slug: "text",
  interfaceName: "TextBlock",
  labels: {
    singular: "Text",
    plural: "Texte",
  },
  fields: [
    {
      name: "content",
      type: "richText",
      required: true,
    },
  ],
};

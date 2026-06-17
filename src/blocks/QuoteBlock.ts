import type { Block } from "payload";

/** Zitat-Block (Sprint 6) — hervorgehobenes Zitat innerhalb der Lesespalte. */
export const QuoteBlock: Block = {
  slug: "quote",
  interfaceName: "QuoteBlock",
  labels: {
    singular: "Zitat",
    plural: "Zitate",
  },
  fields: [
    {
      name: "quote",
      type: "textarea",
      required: true,
    },
    {
      name: "attribution",
      type: "text",
      label: "Zuschreibung",
    },
  ],
};

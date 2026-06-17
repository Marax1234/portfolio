import type { CollectionConfig } from "payload";
import { slugField } from "payload";

/**
 * JournalPosts — Datenmodell für „Journal“ + JournalTeaserSection
 * (Sprint 3). `meta` (Kategorie · Monat Jahr) wird im Frontend aus
 * `category` + `publishedAt` zusammengesetzt (Sprint 5) — hier getrennt
 * gepflegt.
 *
 * Block-Layout (Konzept-Vorbild: Bild/Galerie/Quote/Video-Bausteine) ist
 * bewusst **out of scope** für Sprint 4 — `body` ist vorerst einfacher
 * Lexical-Richtext. Sprint 6 ersetzt/ergänzt dies durch ein Blocks-Feld,
 * ohne dass Titel/Slug/Cover/Kategorie-Felder angetastet werden.
 */
export const JournalPosts: CollectionConfig = {
  slug: "journal",
  labels: {
    singular: "Journal-Beitrag",
    plural: "Journal-Beiträge",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt"],
    group: "Inhalte",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField({ name: "slug", useAsSlug: "title" }),
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Reise", value: "reise" },
        { label: "Sport", value: "sport" },
        { label: "Behind-the-Scenes", value: "behind-the-scenes" },
        { label: "Sonstiges", value: "sonstiges" },
      ],
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "body",
      type: "richText",
    },
    {
      name: "order",
      type: "number",
      label: "Reihenfolge",
      defaultValue: 0,
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
    },
  ],
};

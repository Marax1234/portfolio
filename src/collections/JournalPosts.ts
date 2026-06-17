import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { journalBlocks } from "../blocks";
import { revalidateJournal, revalidateJournalDelete } from "../hooks/revalidate";

/**
 * JournalPosts — Datenmodell für „Journal" + JournalTeaserSection
 * (Sprint 3). `meta` (Kategorie · Monat Jahr) wird im Frontend aus
 * `category` + `publishedAt` zusammengesetzt (Sprint 5) — hier getrennt
 * gepflegt.
 *
 * Block-Layout (Konzept-Vorbild: Bild/Galerie/Quote/Video-Bausteine) ist
 * Sprint 6: das frühere einfache `body`-Richtext-Feld ist durch das
 * `layout`-Blocks-Feld ersetzt — frei stapel- und sortierbar pro Beitrag,
 * ohne Code. Titel/Slug/Cover/Kategorie-Felder bleiben unverändert.
 *
 * Live Preview (Sprint 6, save-triggered): `admin.livePreview`/`preview`
 * zeigen auf die echte Detailseite; `RefreshRouteOnSave`
 * (src/components/RefreshRouteOnSave.tsx) löst dort `router.refresh()` aus.
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
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_SERVER_URL}/journal/${data?.slug ?? ""}`,
    },
    preview: (data) => `${process.env.NEXT_PUBLIC_SERVER_URL}/journal/${data?.slug ?? ""}`,
  },
  hooks: {
    afterChange: [revalidateJournal],
    afterDelete: [revalidateJournalDelete],
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
      name: "excerpt",
      type: "textarea",
      label: "Teaser",
      admin: {
        description: "2-Zeilen-Teaser für den Journal-Feed (Konzept §4.4).",
      },
    },
    {
      name: "layout",
      type: "blocks",
      label: "Beitrags-Layout",
      blocks: journalBlocks,
      admin: {
        description:
          "Frei stapel- und sortierbare Layout-Bausteine (Text/Bild/Galerie/Zwei-Spalten/Zitat/Video) — ohne Code.",
      },
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

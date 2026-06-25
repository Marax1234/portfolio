import type { GlobalConfig } from "payload";
import { revalidateAboutPage } from "../hooks/revalidate";

/**
 * AboutPage — Singleton-Inhalte der Über-mich-Seite (Sprint 5, Konzept §4.3).
 *
 * Struktur folgt dem Konzept top-down: großes Portrait/Action-Bild → Story
 * (3–4 Absätze, erste Person) → Meilenstein-Timeline (sportlich + kreativ
 * gemischt) → „Was mich ausmacht“ (Stichworte statt Floskeln) →
 * Backstage-Grid. Footer-CTAs nutzt die bestehende SplitCTA-Komponente,
 * daher kein eigenes Feld hier.
 *
 * Bewusst getrennt von `SiteConfig` (Startseiten-Intro) — eigener Inhalt,
 * eigene Pflege im Admin.
 */
export const AboutPage: GlobalConfig = {
  slug: "about-page",
  label: "Über-mich-Seite",
  admin: {
    group: "Inhalte",
  },
  hooks: {
    afterChange: [revalidateAboutPage],
  },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Hero",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Über mich" },
        { name: "headline", type: "text", defaultValue: "Kilian Siebert" },
        { name: "image", type: "upload", relationTo: "media", label: "Portrait-/Action-Bild" },
      ],
    },
    {
      name: "story",
      type: "richText",
      label: "Story-Text",
      admin: {
        description: "3–4 kurze Absätze, erste Person, zeigen statt behaupten (Konzept §7).",
      },
    },
    {
      name: "milestones",
      type: "array",
      label: "Meilensteine",
      admin: {
        description: "Sportlich + kreativ gemischt, chronologisch, nüchtern (Konzept §4.3).",
      },
      fields: [
        { name: "year", type: "text", required: true, label: "Jahr" },
        { name: "title", type: "text", required: true },
        { name: "description", type: "text" },
      ],
    },
    {
      name: "whatDefinesMe",
      type: "array",
      label: "Was mich ausmacht",
      minRows: 0,
      maxRows: 5,
      admin: {
        description: "3–5 Stichworte statt Floskeln (Konzept §4.3).",
      },
      fields: [
        { name: "point", type: "text", required: true },
        { name: "description", type: "text" },
      ],
    },
    {
      name: "backstage",
      type: "array",
      label: "Backstage-Grid",
      admin: {
        description: "Alltags-/Backstage-Bilder — lockerer Grid, „den Menschen greifen“.",
      },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        {
          name: "period",
          type: "text",
          label: "Zeitraum",
          admin: {
            description: "Ungefähr, kein genaues Datum (z. B. „Frühjahr 2024“, „Sommer in Lissabon“).",
          },
        },
        {
          name: "caption",
          type: "text",
          label: "Kurzbeschreibung",
          admin: {
            description: "Ein Satz, der beim Hovern erscheint. Minimal halten.",
          },
        },
      ],
    },
  ],
};

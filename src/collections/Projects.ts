import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { revalidateProjects, revalidateProjectsDelete } from "../hooks/revalidate";

/**
 * Projects — Datenmodell für „Arbeiten“ + die Startseiten-Module
 * (WhatIDoSection-Tiles, FeaturedSection) aus Sprint 3.
 *
 * Feldshape ist bewusst kompatibel zu `ProjectCardProps`
 * (src/components/ui/ProjectCard.tsx: id/title/meta/href) sowie zur
 * FeaturedSection (cover/title/body/ctaLabel/ctaHref) gehalten, damit
 * Sprint 5 die Komponenten ohne Umbau an Payload-Daten andocken kann.
 *
 * Kategorien folgen der Arbeiten-Filterleiste aus dem Konzept (§4.3).
 *
 * Sprint 5 ergänzt `location`/`client` (Kontextblock) und `gallery`
 * (Bild-/Video-Strecke) für die Projekt-Detailseite.
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "featured", "publishedAt"],
    group: "Inhalte",
  },
  hooks: {
    afterChange: [revalidateProjects],
    afterDelete: [revalidateProjectsDelete],
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
        { label: "Hochzeiten", value: "hochzeiten" },
        { label: "Menschen", value: "menschen" },
        { label: "Reisen", value: "reisen" },
        { label: "Sport", value: "sport" },
        { label: "Commercial", value: "commercial" },
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
      type: "text",
      label: "Kurztext (Karten-Teaser)",
    },
    {
      name: "body",
      type: "richText",
      label: "Beschreibung",
    },
    {
      name: "location",
      type: "text",
      label: "Ort",
      admin: {
        description: "Für den Kontextblock der Detailseite (Konzept §4.2: „Ort · für wen“).",
      },
    },
    {
      name: "client",
      type: "text",
      label: "Für wen",
      admin: {
        description: "Auftraggeber/in oder Anlass, z.B. „Lisa & Max“ oder „Triathlon Hamburg e.V.“.",
      },
    },
    {
      name: "gallery",
      type: "array",
      label: "Bild-/Video-Strecke",
      admin: {
        description:
          "Detailseiten-Strecke (Konzept §4.2: „Bild ist Hauptsache, Text ist Beilage“). Video-Slots folgen Sprint 8 — vorerst Bilder.",
      },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      label: "Als Featured-Projekt auf der Startseite zeigen",
    },
    {
      name: "ctaLabel",
      type: "text",
      defaultValue: "Projekt ansehen",
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.featured),
      },
    },
    {
      name: "ctaHref",
      type: "text",
      admin: {
        description: "Ziel-Link des Featured-CTAs, z.B. /arbeiten/<slug>.",
        condition: (_, siblingData) => Boolean(siblingData?.featured),
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
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
    },
  ],
};

import type { CollectionConfig } from "payload";
import { slugField } from "payload";

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
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "featured", "publishedAt"],
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

import type { GlobalConfig } from "payload";
import { revalidateSiteConfig } from "../hooks/revalidate";

/**
 * SiteConfig — Singleton-Inhalte der Startseite, die in Sprint 3 inline
 * in den Section-Komponenten hartkodiert waren (HeroSection, IntroSection,
 * FactsStrip, SplitCTA). Sprint 5 liest diese Felder statt der
 * Platzhaltertexte — die Komponenten-Props ändern sich dabei nicht.
 */
export const SiteConfig: GlobalConfig = {
  slug: "site-config",
  label: "Seiten-Konfiguration",
  admin: {
    group: "Inhalte",
  },
  hooks: {
    afterChange: [revalidateSiteConfig],
  },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Hero",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Fotograf & Videograf" },
        { name: "name", type: "text", defaultValue: "Kilian Siebert" },
        {
          name: "tagline",
          type: "textarea",
          defaultValue:
            "Ich filme das, was sich zu erleben lohnt — auf dem Rad genauso wie auf einer Hochzeit.",
        },
        { name: "scrollHint", type: "text", defaultValue: "↓ Scrollen" },
        {
          name: "poster",
          type: "upload",
          relationTo: "media",
          label: "Hero-Standbild (Video-Loop folgt in Sprint 8)",
        },
      ],
    },
    {
      name: "intro",
      type: "group",
      label: "Intro",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Über mich" },
        { name: "portrait", type: "upload", relationTo: "media" },
        { name: "body", type: "richText", label: "Text" },
      ],
    },
    {
      name: "whatIDo",
      type: "group",
      label: "„Was ich mache“ — Überschrift",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Was ich mache" },
        { name: "headline", type: "text", defaultValue: "Menschen, Reisen, Sport." },
      ],
    },
    {
      name: "whatIDoTiles",
      label: "„Was ich mache“ — Kacheln",
      type: "array",
      minRows: 0,
      maxRows: 3,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true, defaultValue: "/arbeiten" },
        { name: "media", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      name: "journalTeaser",
      type: "group",
      label: "„Aus dem Journal“ — Überschrift",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Aus dem Journal" },
        { name: "headline", type: "text", defaultValue: "Laufende Geschichten." },
      ],
    },
    {
      name: "facts",
      type: "array",
      label: "Fakten-Strip",
      minRows: 0,
      maxRows: 6,
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    {
      name: "ctaLeft",
      type: "group",
      label: "Geteilter CTA — links",
      fields: [
        { name: "headline", type: "text", defaultValue: "Projekt anfragen." },
        { name: "subline", type: "text" },
        { name: "buttonLabel", type: "text", defaultValue: "Kontakt" },
        { name: "buttonHref", type: "text", defaultValue: "/kontakt" },
      ],
    },
    {
      name: "ctaRight",
      type: "group",
      label: "Geteilter CTA — rechts",
      fields: [
        { name: "headline", type: "text", defaultValue: "Zusammenarbeiten." },
        { name: "subline", type: "text" },
        { name: "buttonLabel", type: "text", defaultValue: "Kooperationen" },
        { name: "buttonHref", type: "text", defaultValue: "/kooperationen" },
      ],
    },
  ],
};

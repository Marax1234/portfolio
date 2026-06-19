import type { GlobalConfig } from "payload";
import { revalidateCooperationsPage } from "../hooks/revalidate";

/**
 * CooperationsPage — Singleton-Inhalte der Kooperationen-Seite (Sprint 9,
 * Konzept §4.5).
 *
 * Struktur folgt dem Konzept top-down:
 *   1. Einleitung — 1 Satz: was du für Marken machst
 *   2. Was ich biete / Für wen — zwei Spalten (Services + Branchen)
 *   3. Reichweite / Audience — Zahlen für FactsStrip
 *   4. Bisherige Kooperationen — Logos / Kurzbeschreibungen
 *   5. CTA-Zeile — Media-Kit-Download + Anfrage-CTA
 *
 * Inhalt ist bewusst schlank bis echte Reichweite-Daten vorliegen.
 * Felder dienen als Platzhalter, die ohne Code-Änderung befüllt werden können.
 */
export const CooperationsPage: GlobalConfig = {
  slug: "cooperations-page",
  label: "Kooperationen-Seite",
  admin: {
    group: "Inhalte",
    description: "Inhalte der Kooperationen-/Sponsoren-Seite (Konzept §4.5).",
  },
  hooks: {
    afterChange: [revalidateCooperationsPage],
  },
  fields: [
    {
      name: "intro",
      type: "textarea",
      label: "Einleitung",
      admin: {
        description: "1 Satz: was du für Marken machst. Knapp und direkt (Konzept §7).",
      },
    },
    {
      name: "services",
      type: "array",
      label: "Was ich biete",
      admin: {
        description: "Konkrete Leistungen (Content-Produktion, Social Formats, …).",
      },
      fields: [{ name: "item", type: "text", required: true, label: "Leistung" }],
    },
    {
      name: "industries",
      type: "array",
      label: "Für wen",
      admin: {
        description: "Branchen / Zielgruppen (Outdoor/Sport, Reise/Travel, …).",
      },
      fields: [{ name: "item", type: "text", required: true, label: "Branche" }],
    },
    {
      name: "reachFacts",
      type: "array",
      label: "Reichweite-Zahlen",
      admin: {
        description:
          "Für den Fakten-Strip — ehrlich, nicht geschönt (Konzept §4.5). " +
          "Leer lassen bis echte Zahlen vorliegen.",
      },
      fields: [
        { name: "value", type: "text", required: true, label: "Zahl / Wert" },
        { name: "label", type: "text", required: true, label: "Bezeichnung" },
      ],
    },
    {
      name: "priorCooperations",
      type: "array",
      label: "Bisherige Kooperationen",
      admin: {
        description: "Logos + Kurzbeschreibungen bereits abgeschlossener Projekte.",
      },
      fields: [
        { name: "name", type: "text", required: true, label: "Name / Marke" },
        { name: "note", type: "text", label: "Kurze Beschreibung (optional)" },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          label: "Logo (optional)",
        },
      ],
    },
    {
      name: "mediaKit",
      type: "upload",
      relationTo: "documents",
      label: "Media-Kit (PDF)",
      admin: {
        description:
          "PDF-Datei aus der Documents-Collection — wird über den Download-Button verlinkt. " +
          "Austauschbar ohne Code-Änderung.",
      },
    },
    {
      name: "mediaKitLabel",
      type: "text",
      label: "Media-Kit Button-Label",
      defaultValue: "Media-Kit herunterladen",
    },
  ],
};

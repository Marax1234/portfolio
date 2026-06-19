import type { CollectionConfig } from "payload";
import { notifyContactSubmission } from "../hooks/notify";

/**
 * ContactSubmissions — Inbox für Kontaktanfragen (Sprint 9,
 * Konzept §4.6 „Kontakt").
 *
 * Datenmodell in Sprint 4 angelegt; Sprint 9 ergänzt:
 *   - `category`-Feld (Dropdown: Hochzeit / Reise / Marke / Sonstiges)
 *   - `notifyContactSubmission`-Hook → E-Mail-Benachrichtigung bei neuer Anfrage
 *
 * Das Frontend-Formular (/kontakt) schreibt über die Local API in diese
 * Collection (Server Action in src/app/(frontend)/kontakt/actions.ts).
 * Honeypot + Timing-Schutz sind im Server Action implementiert — nicht hier.
 *
 * Kein Revalidate-Hook nötig: es gibt keine öffentliche Seite, die
 * ContactSubmissions rendert.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  labels: {
    singular: "Kontaktanfrage",
    plural: "Kontaktanfragen",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "category", "read", "createdAt"],
    group: "System",
    description: "Eingehende Anfragen ueber das Kontaktformular.",
  },
  access: {
    // Anfragen kommen öffentlich über das Kontaktformular herein;
    // eingesehen werden sie nur im Admin (Default: authentifiziert).
    create: () => true,
  },
  hooks: {
    afterChange: [notifyContactSubmission],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Name",
    },
    {
      name: "email",
      type: "email",
      required: true,
      label: "E-Mail",
    },
    {
      name: "category",
      type: "select",
      required: true,
      label: "Kategorie",
      admin: {
        description: "Voraussortierung nach Anfrage-Art (Konzept §4.6).",
      },
      options: [
        { label: "Hochzeit", value: "hochzeit" },
        { label: "Reise", value: "reise" },
        { label: "Marke", value: "marke" },
        { label: "Sonstiges", value: "sonstiges" },
      ],
    },
    {
      name: "message",
      type: "textarea",
      required: true,
      label: "Nachricht",
    },
    {
      name: "read",
      type: "checkbox",
      defaultValue: false,
      label: "Gelesen",
    },
  ],
  timestamps: true,
};

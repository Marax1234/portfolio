import type { CollectionConfig } from "payload";

/**
 * ContactSubmissions — reines Datenmodell für Sprint 4.
 *
 * Formular-Verarbeitung (Frontend-Form, Validierung, Mail-Benachrichtigung)
 * ist Sprint 9 (siehe Sprintplan Sprint 9 „Kontakt, Inbox & Kooperationen“).
 * Hier wird nur die Collection angelegt, in die Sprint 9 schreibt.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  labels: {
    singular: "Kontaktanfrage",
    plural: "Kontaktanfragen",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "read", "createdAt"],
    group: "System",
  },
  access: {
    // Anfragen kommen in Sprint 9 ungeschützt (öffentlich) über das
    // Kontaktformular herein; eingesehen werden sie nur im Admin.
    create: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "message",
      type: "textarea",
      required: true,
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

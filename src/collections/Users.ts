import type { CollectionConfig } from "payload";

/**
 * Users — Admin-Login (Sprint 4).
 *
 * `auth: true` aktiviert Payloads eingebautes Login/Session-System.
 * `roles` ist als Vorbereitung für später mehrere Personen angelegt
 * (§0.5 Sprintplan — Modularität & Vorausschau); feingranulare
 * Access-Control je Rolle ist nicht Teil von Sprint 4.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "System",
  },
  fields: [
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["admin"],
      options: [
        { label: "Admin", value: "admin" },
        { label: "Redakteur", value: "editor" },
      ],
    },
  ],
};

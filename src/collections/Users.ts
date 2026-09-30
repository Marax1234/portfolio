import type { CollectionConfig } from "payload";

/**
 * Users — Admin-Login (Sprint 4).
 *
 * `auth: true` aktiviert Payloads eingebautes Login/Session-System.
 * `roles` ist als Vorbereitung für später mehrere Personen angelegt
 * (§0.5 Sprintplan — Modularität & Vorausschau); feingranulare
 * Access-Control je Rolle ist nicht Teil von Sprint 4.
 *
 * B25 B1/H-12: `/admin` bleibt öffentlich (Kilian pflegt ohne VPN). Deshalb Login-Schutz
 * explizit statt über Defaults: 5 Fehlversuche → 10 min Sperre, Entsperren nur durch
 * eingeloggte Nutzer, Session-Cookie in Produktion nur über HTTPS. Alle übrigen
 * Operationen verlangen per Payload-Default einen Login.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      sameSite: "Lax",
      // Caddy terminiert TLS; lokal (`next dev`) und im DAST-Job läuft HTTP.
      secure: process.env.NODE_ENV === "production",
    },
  },
  access: {
    unlock: ({ req }) => Boolean(req.user),
  },
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

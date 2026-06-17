import { fileURLToPath } from "node:url";
import path from "path";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { Config } from "payload";
import { buildConfig } from "payload";
import sharp from "sharp";

import { ContactSubmissions } from "./collections/ContactSubmissions";
import { JournalPosts } from "./collections/JournalPosts";
import { Media } from "./collections/Media";
import { Projects } from "./collections/Projects";
import { Users } from "./collections/Users";
import { AboutPage } from "./globals/AboutPage";
import { SiteConfig } from "./globals/SiteConfig";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Payload-3-Kernkonfiguration (Sprint 4 — Payload-Datenmodell & Admin).
 *
 * Läuft im selben Codebase/Prozess wie Next.js (kein zweiter Server,
 * siehe tech-stack-konfiguration.md §2.2). Versionsstand: Payload 3.85.1
 * (Context7-Doku gezogen, §0.3 Sprintplan).
 */
export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET ?? "",
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects, JournalPosts, ContactSubmissions],
  globals: [SiteConfig, AboutPage],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  // Bekannte Typdiskrepanz zwischen sharps Funktions-Overloads und Payloads
  // `SharpDependency`-Typ (siehe Payload-GitHub-Issues zu `sharp`-Typings) —
  // Laufzeitverhalten ist unverändert, daher expliziter, dokumentierter Cast.
  sharp: sharp as Config["sharp"],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});

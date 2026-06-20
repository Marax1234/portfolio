import { fileURLToPath } from "node:url";
import path from "path";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import type { Config } from "payload";
import { buildConfig } from "payload";
import sharp from "sharp";

import { ContactSubmissions } from "./collections/ContactSubmissions";
import { Documents } from "./collections/Documents";
import { JournalPosts } from "./collections/JournalPosts";
import { Media } from "./collections/Media";
import { Projects } from "./collections/Projects";
import { Users } from "./collections/Users";
import { Videos } from "./collections/Videos";
import { AboutPage } from "./globals/AboutPage";
import { CooperationsPage } from "./globals/CooperationsPage";
import { SiteConfig } from "./globals/SiteConfig";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Payload-3-Kernkonfiguration.
 *
 * Sprint 4 — Payload-Datenmodell & Admin (Basis).
 * Sprint 9 — E-Mail-Adapter (nodemailer), Documents-Collection,
 *            CooperationsPage-Global (Konzept §4.5).
 * Sprint 10 — admin.components.beforeDashboard (Statistik-Karten via Umami).
 *
 * Läuft im selben Codebase/Prozess wie Next.js (kein zweiter Server,
 * siehe tech-stack-konfiguration.md §2.2). Versionsstand: Payload 3.85.1.
 *
 * E-Mail (Sprint 9):
 *   - Ohne SMTP_HOST → nodemailerAdapter ohne transport → Ethereal-Testaccount
 *     (Payload erzeugt automatisch einen) → Preview-URL im Log (dev-Nachweis).
 *   - Mit SMTP_HOST → echter nodemailer-Transport (Prod-Konfiguration im
 *     Deployment, siehe .env.example und Sprintplan §4 „Post-Development").
 */

function buildEmailAdapter() {
  const from = process.env.EMAIL_FROM ?? "noreply@kilia-siebert.de";
  const fromName = process.env.EMAIL_FROM_NAME ?? "Kilian Siebert Portfolio";

  if (process.env.SMTP_HOST) {
    return nodemailerAdapter({
      defaultFromAddress: from,
      defaultFromName: fromName,
      // `transportOptions` wird intern an nodemailer.createTransport übergeben.
      // Kein direkter nodemailer-Import nötig (Adapter bundelt nodemailer).
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? "587", 10),
        auth: {
          user: process.env.SMTP_USER ?? "",
          pass: process.env.SMTP_PASS ?? "",
        },
      },
    });
  }

  // Dev-Modus: Ethereal-Testaccount (kein echter Versand, Preview-URL im Log)
  return nodemailerAdapter({
    defaultFromAddress: from,
    defaultFromName: fromName,
  });
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET ?? "",
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Sprint 10: Statistik-Karten oben im Admin-Dashboard (vor Collections).
    // Zeigt Umami-Metriken wenn UMAMI_API_URL/ADMIN_USERNAME/ADMIN_PASSWORD/WEBSITE_ID gesetzt sind,
    // sonst Deployment-Hinweis (Akzeptanzkriterium Sprint 10).
    components: {
      beforeDashboard: ["@/components/admin/StatsDashboard"],
    },
  },
  collections: [Users, Media, Videos, Projects, JournalPosts, ContactSubmissions, Documents],
  globals: [SiteConfig, AboutPage, CooperationsPage],
  editor: lexicalEditor(),
  email: buildEmailAdapter(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // Push ist laut Payload-Doku ohnehin nur in development aktiv — in
    // production zählen ausschließlich Migrations (siehe deploy.md / Dockerfile,
    // `payload migrate` läuft vor `next build`, da /arbeiten/[slug] per
    // generateStaticParams schon beim Build gegen die DB läuft).
    push: false,
    prodMigrations: migrations,
  }),
  // Sprint 7: Uploads der `media`-Collection landen im Object Storage
  // (MinIO lokal, siehe docker-compose.dev.yml) statt im lokalen `staticDir`
  // — Collection-Schema bleibt stabil (src/collections/Media.ts).
  // `disablePayloadAccessControl` + `generateFileURL` liefern direkte
  // Storage-URLs statt eines Payload-Proxys (Produktions-Pendant: CDN vor
  // Object Storage, siehe Sprintplan §4 „Ausblick").
  // Sprint 8: Videos-Collection ebenfalls in den Object Storage routen.
  // Originale landen unter `videos/<file>` im Bucket.
  // Abgeleitete HLS-Ausgaben (Segmente + Playlist + Poster) werden separat
  // via @aws-sdk/client-s3 unter `videos/hls/<id>/` hochgeladen
  // (src/lib/video/transcode.ts).
  // Sprint 9: Documents-Collection (PDFs, z.B. Media-Kit) in den Object
  // Storage routen, unter Prefix `documents/<file>`.
  plugins: [
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${prefix ? `${prefix}/` : ""}${filename}`,
        },
        videos: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${prefix ? `${prefix}/` : ""}${filename}`,
        },
        documents: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${prefix ? `${prefix}/` : ""}${filename}`,
        },
      },
      bucket: process.env.S3_BUCKET ?? "",
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
      },
    }),
  ],
  // Bekannte Typdiskrepanz zwischen sharps Funktions-Overloads und Payloads
  // `SharpDependency`-Typ (siehe Payload-GitHub-Issues zu `sharp`-Typings) —
  // Laufzeitverhalten ist unverändert, daher expliziter, dokumentierter Cast.
  sharp: sharp as Config["sharp"],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});

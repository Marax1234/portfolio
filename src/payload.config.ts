import os from "node:os";
import { fileURLToPath } from "node:url";
import path from "path";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import type { Config } from "payload";
import nodemailer from "nodemailer";
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
import { readServerEnv } from "./lib/env";
import { MAX_VIDEO_BYTES } from "./lib/video/limits";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// S-04: bricht mit allen fehlenden Namen ab (außer während `next build`).
const env = readServerEnv();

/**
 * Payload-3-Kernkonfiguration.
 *
 * Sprint 4 — Payload-Datenmodell & Admin (Basis).
 * Sprint 9 — E-Mail-Adapter (nodemailer), Documents-Collection,
 *            CooperationsPage-Global (Konzept §4.5).
 * Sprint 10 — admin.components.beforeDashboard (Statistik-Karten via Umami).
 *
 * Läuft im selben Codebase/Prozess wie Next.js (kein zweiter Server,
 * siehe tech-stack-konfiguration.md §2.2). Version: siehe package.json.
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
      // Transport selbst erzeugen statt `transportOptions`: Der Adapter typisiert die
      // Optionen als SMTPConnection.Options, die in nodemailer 10 (eigene Typen) kein
      // `auth` mehr enthalten. Zur Laufzeit identisch (Adapter ruft createTransport auf).
      transport: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? "587", 10),
        auth: {
          user: process.env.SMTP_USER ?? "",
          pass: process.env.SMTP_PASS ?? "",
        },
      }),
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
  secret: env.PAYLOAD_SECRET,
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
      connectionString: env.DATABASE_URI,
    },
    // Push ist laut Payload-Doku ohnehin nur in development aktiv — in
    // production zählen ausschließlich Migrations. Sie laufen beim Start der App
    // (`prodMigrations`, ausgelöst spätestens vom Healthcheck /api/health); der
    // Build braucht keine DB (B25 Session 10).
    push: false,
    prodMigrations: migrations,
  }),
  // Sprint 7: Uploads der `media`-Collection landen im Object Storage
  // (Garage, siehe docker-compose.dev.yml) statt im lokalen `staticDir`
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
      bucket: env.S3_BUCKET,
      config: {
        endpoint: env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
        // Garage liefert nach Multipart-Uploads eine Composite-Checksumme ohne
        // "-<Teile>"-Suffix; das SDK prüft sie als Volltext-Checksumme und bricht
        // GetObject mit "Checksum mismatch" ab (Garage-Issue #1228). Checksummen
        // daher nur, wenn die Operation sie verlangt.
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        },
      },
    }),
  ],
  // Bekannte Typdiskrepanz zwischen sharps Funktions-Overloads und Payloads
  // `SharpDependency`-Typ (siehe Payload-GitHub-Issues zu `sharp`-Typings) —
  // Laufzeitverhalten ist unverändert, daher expliziter, dokumentierter Cast.
  sharp: sharp as Config["sharp"],
  // O-06 (B25 Session 8): Uploads als Temp-Datei statt komplett im Heap (mem_limit 2g,
  // Videos > 1 GB sind möglich). storage-s3 streamt die Datei dann per Multipart in den
  // Bucket. /tmp statt des Defaults `./tmp`, weil /app im Image nicht beschreibbar ist.
  // Payload 3.90 begrenzt ohne Angabe auf 20 MB pro Datei und 50 MB pro Request, damit
  // scheiterten größere Videos schon beim Upload. Reserve für die übrigen Formularfelder.
  upload: {
    useTempFiles: true,
    tempFileDir: path.join(os.tmpdir(), "payload-uploads"),
    limits: { fileSize: MAX_VIDEO_BYTES },
    requestSizeLimit: MAX_VIDEO_BYTES + 16 * 1024 * 1024,
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});

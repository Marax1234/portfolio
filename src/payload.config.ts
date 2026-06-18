import { fileURLToPath } from "node:url";
import path from "path";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import type { Config } from "payload";
import { buildConfig } from "payload";
import sharp from "sharp";

import { ContactSubmissions } from "./collections/ContactSubmissions";
import { JournalPosts } from "./collections/JournalPosts";
import { Media } from "./collections/Media";
import { Projects } from "./collections/Projects";
import { Users } from "./collections/Users";
import { Videos } from "./collections/Videos";
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
  collections: [Users, Media, Videos, Projects, JournalPosts, ContactSubmissions],
  globals: [SiteConfig, AboutPage],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
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

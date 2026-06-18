/**
 * ObjectStorageProvider — Medien-Abstraktion v2 (Sprint 7)
 *
 * Löst den lokalen Manifest-Fallback aus Sprint 1 (`local-provider.ts`) ab.
 * Gleiche Slot-IDs, gleiche Maße/Alt-Texte — nur `src` zeigt jetzt auf den
 * Object Storage (MinIO lokal, siehe docker-compose.dev.yml) statt auf
 * `/public/media/`. Das `MediaProvider`-Interface (`./types`) ist identisch
 * geblieben, daher ändert sich an Aufrufern (`<Media id="..." />`) nichts.
 *
 * Der statische Platzhalter (`static/placeholder.svg`) wird beim
 * `pnpm db:up`-Bootstrap (`createbuckets`-Service) einmalig in den Bucket
 * hochgeladen.
 */

import type { MediaProvider, MediaRef, ResolvedMedia } from "./types";

/** Typ eines einzelnen Manifest-Eintrags. */
interface ManifestEntry {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL?: string;
  unoptimized?: boolean;
}

const publicBaseUrl =
  process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "http://localhost:9000/portfolio-media";

/** Alle Slots verweisen auf dasselbe statische Platzhalter-SVG im Bucket. */
const PLACEHOLDER_SRC = `${publicBaseUrl}/static/placeholder.svg`;

/**
 * Statisches Manifest — inhaltlich identisch zu `local-provider.ts`
 * (Sprint 1–6), nur die `src`-Werte zeigen jetzt auf den Object Storage.
 */
const MANIFEST: Record<string, ManifestEntry> = {
  placeholder: {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 600,
    alt: "Platzhalter-Bild (Sprint 7 — Object Storage)",
    unoptimized: true,
  },

  "hero-poster": {
    src: PLACEHOLDER_SRC,
    width: 1600,
    height: 900,
    alt: "Hero-Standbild — Platzhalter für den Video-Loop aus Sprint 8",
    unoptimized: true,
  },
  portrait: {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 1000,
    alt: "Portrait — Platzhalter (Sprint 5: echtes Bild aus Payload)",
    unoptimized: true,
  },
  "tile-menschen": {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 800,
    alt: "Kachel Menschen — Platzhalter",
    unoptimized: true,
  },
  "tile-reisen": {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 800,
    alt: "Kachel Reisen — Platzhalter",
    unoptimized: true,
  },
  "tile-sport": {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 800,
    alt: "Kachel Sport — Platzhalter",
    unoptimized: true,
  },
  featured: {
    src: PLACEHOLDER_SRC,
    width: 1600,
    height: 1000,
    alt: "Featured-Projekt — Platzhalter",
    unoptimized: true,
  },
  "journal-1": {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 600,
    alt: "Journal-Teaser 1 — Platzhalter",
    unoptimized: true,
  },
  "journal-2": {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 600,
    alt: "Journal-Teaser 2 — Platzhalter",
    unoptimized: true,
  },
  "journal-3": {
    src: PLACEHOLDER_SRC,
    width: 800,
    height: 600,
    alt: "Journal-Teaser 3 — Platzhalter",
    unoptimized: true,
  },
};

const objectStorageProvider: MediaProvider = {
  resolve(ref: MediaRef): ResolvedMedia {
    const entry = MANIFEST[ref.id];

    if (!entry) {
      // Graceful fallback: fehlende ID gibt ein neutrales Placeholder zurück
      console.warn(
        `[ObjectStorageProvider] Medium "${ref.id}" nicht im Manifest gefunden. Fallback auf placeholder.`
      );
      return MANIFEST["placeholder"];
    }

    return entry;
  },
};

export default objectStorageProvider;

/**
 * LocalProvider — Medien-Abstraktion v1 (Sprint 1)
 *
 * PLATZHALTER: Lädt Mediendaten aus einem lokalen Manifest, das auf Dateien
 * in /public/media/ verweist. Dient ausschließlich als Entwicklungs-Fallback
 * für Sprints 1–6.
 *
 * Sprint 7 ersetzt diese Datei durch ObjectStorageProvider — das Interface
 * (MediaProvider) bleibt identisch, Aufrufer ändern sich nicht.
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

/**
 * Statisches Manifest: wird zur Build-Zeit einmalig geladen.
 * In Sprint 7 wird dies durch API-Calls zum Object-Storage-Provider ersetzt.
 */
const MANIFEST: Record<string, ManifestEntry> = {
  placeholder: {
    src: "/media/placeholder.svg",
    width: 800,
    height: 600,
    alt: "Platzhalter-Bild (Sprint 1 — lokaler Fallback; wird in Sprint 7 durch Object Storage ersetzt)",
    unoptimized: true,
  },

  /* ── Sprint 3: benannte Startseiten-Slots ──────────────────────────
   * Alle zeigen vorerst auf dasselbe Platzhalter-SVG, sind aber unter
   * sprechenden IDs angelegt, damit Sprint 5 (Payload-Inhalte) und
   * Sprint 7 (Object Storage) gezielt einzelne Slots ersetzen können,
   * ohne dass aufrufende Komponenten geändert werden müssen.
   */
  "hero-poster": {
    src: "/media/placeholder.svg",
    width: 1600,
    height: 900,
    alt: "Hero-Standbild — Platzhalter für den Video-Loop aus Sprint 8",
    unoptimized: true,
  },
  portrait: {
    src: "/media/placeholder.svg",
    width: 800,
    height: 1000,
    alt: "Portrait — Platzhalter (Sprint 5: echtes Bild aus Payload)",
    unoptimized: true,
  },
  "tile-menschen": {
    src: "/media/placeholder.svg",
    width: 800,
    height: 800,
    alt: "Kachel Menschen — Platzhalter",
    unoptimized: true,
  },
  "tile-reisen": {
    src: "/media/placeholder.svg",
    width: 800,
    height: 800,
    alt: "Kachel Reisen — Platzhalter",
    unoptimized: true,
  },
  "tile-sport": {
    src: "/media/placeholder.svg",
    width: 800,
    height: 800,
    alt: "Kachel Sport — Platzhalter",
    unoptimized: true,
  },
  featured: {
    src: "/media/placeholder.svg",
    width: 1600,
    height: 1000,
    alt: "Featured-Projekt — Platzhalter",
    unoptimized: true,
  },
  "journal-1": {
    src: "/media/placeholder.svg",
    width: 800,
    height: 600,
    alt: "Journal-Teaser 1 — Platzhalter",
    unoptimized: true,
  },
  "journal-2": {
    src: "/media/placeholder.svg",
    width: 800,
    height: 600,
    alt: "Journal-Teaser 2 — Platzhalter",
    unoptimized: true,
  },
  "journal-3": {
    src: "/media/placeholder.svg",
    width: 800,
    height: 600,
    alt: "Journal-Teaser 3 — Platzhalter",
    unoptimized: true,
  },
};

const localProvider: MediaProvider = {
  resolve(ref: MediaRef): ResolvedMedia {
    const entry = MANIFEST[ref.id];

    if (!entry) {
      // Graceful fallback: fehlende ID gibt ein neutrales Placeholder zurück
      console.warn(
        `[LocalProvider] Medium "${ref.id}" nicht im Manifest gefunden. Fallback auf placeholder.`
      );
      return MANIFEST["placeholder"];
    }

    return entry;
  },
};

export default localProvider;

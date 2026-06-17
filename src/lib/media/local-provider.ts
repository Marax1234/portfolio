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

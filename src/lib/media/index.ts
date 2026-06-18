/**
 * Medien-Abstraktion — Single Export Point
 *
 * Dies ist die EINZIGE Stelle, die beim Wechsel des Providers geändert
 * werden muss. Alle anderen Aufrufer importieren von hier.
 */

export type {
  MediaRef,
  PayloadImageSource,
  PayloadMediaRef,
  AnyMediaRef,
  ResolvedMedia,
  MediaProvider,
} from "./types";
export { payloadMediaRef, resolvePayloadMedia } from "./payload";

import objectStorageProvider from "./object-storage-provider";

/**
 * Der aktive Medien-Provider.
 * Sprint 1–6: LocalProvider (lokaler Datei-Fallback, `local-provider.ts`,
 * weiterhin im Repo als Referenz).
 * Sprint 7: ObjectStorageProvider — liefert Manifest-Slots aus dem Object
 * Storage (MinIO lokal, siehe docker-compose.dev.yml).
 */
export const mediaProvider = objectStorageProvider;

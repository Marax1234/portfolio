/**
 * Medien-Abstraktion — Single Export Point
 *
 * Dies ist die EINZIGE Stelle, die beim Wechsel des Providers (Sprint 7)
 * geändert werden muss. Alle anderen Aufrufer importieren von hier.
 *
 * Sprint 7: `localProvider` durch `objectStorageProvider` ersetzen.
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

import localProvider from "./local-provider";

/**
 * Der aktive Medien-Provider.
 * Aktuell: LocalProvider (lokaler Datei-Fallback, Sprint 1–6).
 * Sprint 7: Wird auf ObjectStorageProvider umgestellt.
 */
export const mediaProvider = localProvider;

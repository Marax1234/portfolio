/**
 * Medien-Abstraktion — Single Export Point
 *
 * Dies ist die EINZIGE Stelle, die beim Wechsel des Providers (Sprint 7)
 * geändert werden muss. Alle anderen Aufrufer importieren von hier.
 *
 * Sprint 7: `localProvider` durch `objectStorageProvider` ersetzen.
 */

export type { MediaRef, ResolvedMedia, MediaProvider } from "./types";

import localProvider from "./local-provider";

/**
 * Der aktive Medien-Provider.
 * Aktuell: LocalProvider (lokaler Datei-Fallback, Sprint 1–6).
 * Sprint 7: Wird auf ObjectStorageProvider umgestellt.
 */
export const mediaProvider = localProvider;

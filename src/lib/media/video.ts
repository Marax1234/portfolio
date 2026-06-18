/**
 * Video-Brücke der Medien-Abstraktion (Sprint 8)
 *
 * Analog zu `payload.ts` (Bild-Brücke), aber für Video-Upload-Docs.
 * Liest ein populiertes `videos`-Upload-Feld und gibt ein `ResolvedVideo`
 * zurück — oder `undefined`, wenn das Video noch nicht bereit ist.
 *
 * Aufrufer (HeroSection, VideoBlockView) fallen auf das Poster/Standbild
 * zurück, solange `status !== "ready"`.
 */

import type { Video } from "@/payload-types";

/** Aufgelöstes Video — das, was VideoLoop entgegennimmt. */
export interface ResolvedVideo {
  hlsUrl: string;
  posterUrl?: string;
  width: number;
  height: number;
  duration?: number;
  alt: string;
}

type MaybeVideoDoc = number | Video | null | undefined;

/**
 * Wandelt ein Payload-Upload-Feld (`videos`-Collection) in ein `ResolvedVideo`
 * um. Gibt `undefined` zurück, wenn:
 * - das Feld nicht populiert ist (depth zu niedrig, nur ID)
 * - `status !== "ready"`
 * - `hlsUrl` fehlt
 */
export function payloadVideoRef(
  doc: MaybeVideoDoc,
  options: { alt?: string } = {},
): ResolvedVideo | undefined {
  if (!doc || typeof doc !== "object") return undefined;
  if (doc.status !== "ready") return undefined;
  if (!doc.hlsUrl) return undefined;

  return {
    hlsUrl: doc.hlsUrl,
    posterUrl: doc.posterUrl ?? undefined,
    width: doc.width ?? 1920,
    height: doc.height ?? 1080,
    duration: doc.duration ?? undefined,
    alt: options.alt ?? doc.alt ?? doc.title ?? "",
  };
}

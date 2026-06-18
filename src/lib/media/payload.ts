/**
 * Payload-Brücke der Medien-Abstraktion (Sprint 5)
 *
 * Liest ein populiertes Payload-Upload-Feld (number | Media | null) in eine
 * `AnyMediaRef` für <Media> um. Bleibt unabhängig vom LocalProvider/
 * ObjectStorageProvider (Sprint 7) — beide bedienen weiterhin nur den
 * `id`-Zweig der Union.
 */

import type { Media as PayloadMediaDoc } from "@/payload-types";
import type { AnyMediaRef, PayloadImageSource, ResolvedMedia } from "./types";

type MaybeMediaDoc = number | PayloadMediaDoc | null | undefined;
type SizeVariant = "thumbnail" | "card" | "hero";

/**
 * Wandelt ein Payload-Upload-Feld in eine `AnyMediaRef` um.
 * Gibt `undefined` zurück, wenn das Feld nicht populiert ist (z.B. `depth`
 * zu niedrig, nur die ID geladen) oder leer — Aufrufer fallen dann auf
 * einen Manifest-Platzhalter zurück (`<Media id="placeholder" />`).
 */
export function payloadMediaRef(
  doc: MaybeMediaDoc,
  options: { alt?: string; variant?: SizeVariant } = {},
): AnyMediaRef | undefined {
  if (!doc || typeof doc !== "object") return undefined;

  const variantData = options.variant ? doc.sizes?.[options.variant] : undefined;
  const url = variantData?.url ?? doc.url;
  const width = variantData?.width ?? doc.width;
  const height = variantData?.height ?? doc.height;

  if (!url || !width || !height) return undefined;

  const source: PayloadImageSource = {
    url,
    width,
    height,
    alt: options.alt ?? doc.alt,
  };

  return { payload: source };
}

/** Löst eine `PayloadImageSource` direkt in ein `ResolvedMedia` auf (von <Media> genutzt). */
export function resolvePayloadMedia(source: PayloadImageSource): ResolvedMedia {
  return {
    src: source.url,
    width: source.width,
    height: source.height,
    alt: source.alt ?? "",
  };
}

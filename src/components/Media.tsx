/**
 * <Media> — universelle Bild-Komponente (RSC-kompatibel)
 *
 * Einziger erlaubter Weg, Bilder im Portfolio darzustellen.
 * Aufrufer übergeben eine AnyMediaRef — entweder einen Manifest-Slot
 * (`id`, Sprint 1) oder ein bereits aufgelöstes Payload-Upload-Dokument
 * (`payload`, Sprint 5) — nie Pfade, URLs oder Implementierungsdetails
 * des Providers direkt.
 *
 * Datenfluss:
 *   <Media id="placeholder" alt="…" />
 *   → mediaProvider.resolve({ id })
 *   → ResolvedMedia { src, width, height, … }
 *   → <Image … />
 *
 *   <Media payload={payloadMediaRef(project.cover)!} />
 *   → resolvePayloadMedia(source)
 *   → ResolvedMedia { … }
 *   → <Image … />
 *
 * Sprint 7: mediaProvider wird auf Object Storage umgestellt —
 * diese Komponente bleibt unverändert (nur der `id`-Zweig wechselt intern).
 */

import Image from "next/image";
import { mediaProvider, resolvePayloadMedia } from "@/lib/media";
import type { AnyMediaRef } from "@/lib/media";

interface MediaOwnProps {
  /** Alt-Text — überschreibt den Manifest-Default wenn angegeben. */
  alt?: string;
  /**
   * Tailwind-Klassen für den Bild-Wrapper (Größe, Aspect-Ratio, etc.).
   * Beispiel: "w-full aspect-video" oder "w-64 h-64".
   */
  className?: string;
  /**
   * Gilt für das <img>-Element selbst (object-fit, etc.).
   * Beispiel: "object-cover".
   */
  imageClassName?: string;
  /** Priorität für LCP-Elemente (Above the Fold). Default: false. */
  priority?: boolean;
  /**
   * Responsive sizes für next/image — beeinflusst Browser-Quellauswahl.
   * Default: "100vw" (passt für Full-Width-Bilder).
   */
  sizes?: string;
}

type MediaProps = AnyMediaRef & MediaOwnProps;

/**
 * RSC-Komponente — kein "use client" nötig, da keine Client-State-Logik.
 * Kann in Server Components direkt verwendet werden.
 */
export default async function Media({
  alt,
  className,
  imageClassName = "object-cover",
  priority = false,
  sizes = "100vw",
  ...ref
}: MediaProps) {
  const media =
    "payload" in ref
      ? resolvePayloadMedia(ref.payload)
      : await mediaProvider.resolve({ id: ref.id });

  return (
    <div className={className ?? "relative w-full"}>
      <Image
        src={media.src}
        width={media.width}
        height={media.height}
        alt={alt ?? media.alt}
        priority={priority}
        sizes={sizes}
        className={imageClassName}
        placeholder={media.blurDataURL ? "blur" : "empty"}
        blurDataURL={media.blurDataURL}
        unoptimized={media.unoptimized}
      />
    </div>
  );
}

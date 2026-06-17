/**
 * <Media> — universelle Bild-Komponente (RSC-kompatibel)
 *
 * Einziger erlaubter Weg, Bilder im Portfolio darzustellen.
 * Aufrufer übergeben eine MediaRef (id) — nie Pfade, URLs oder
 * Implementierungsdetails des Providers.
 *
 * Datenfluss:
 *   <Media id="placeholder" alt="…" />
 *   → mediaProvider.resolve({ id })
 *   → ResolvedMedia { src, width, height, … }
 *   → <Image … />
 *
 * Sprint 7: mediaProvider wird auf Object Storage umgestellt —
 * diese Komponente bleibt unverändert.
 */

import Image from "next/image";
import { mediaProvider } from "@/lib/media";
import type { MediaRef } from "@/lib/media";

interface MediaProps extends MediaRef {
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

/**
 * RSC-Komponente — kein "use client" nötig, da keine Client-State-Logik.
 * Kann in Server Components direkt verwendet werden.
 */
export default async function Media({
  id,
  alt,
  className,
  imageClassName = "object-cover",
  priority = false,
  sizes = "100vw",
}: MediaProps) {
  const media = await mediaProvider.resolve({ id });

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

/**
 * Medien-Abstraktion — Typen & Interface
 *
 * Aufrufer (Komponenten, Seiten) importieren nur diese Typen und das
 * mediaProvider-Singleton aus index.ts. Die konkrete Implementierung
 * (lokaler Fallback, Object Storage, CDN) bleibt für Aufrufer unsichtbar.
 *
 * Sprint 7 tauscht LocalProvider gegen ObjectStorageProvider aus —
 * OHNE dass aufrufende Komponenten geändert werden müssen (§0.5).
 */

/** Referenz auf ein Medium — das, was Aufrufer übergeben. */
export interface MediaRef {
  /** Eindeutiger Bezeichner des Mediums im aktuellen Provider. */
  id: string;
}

/** Aufgelöstes Medium — das, was Provider zurückgeben. */
export interface ResolvedMedia {
  /** Absoluter Pfad oder URL zur Bilddatei. */
  src: string;
  /** Breite in Pixeln (für next/image erforderlich). */
  width: number;
  /** Höhe in Pixeln (für next/image erforderlich). */
  height: number;
  /** Alt-Text (Barrierefreiheit). */
  alt: string;
  /**
   * Optionaler Base64-Blur-Placeholder für next/image (placeholder="blur").
   * Provider können ihn liefern; fehlt er, wird kein Blur-Effekt gezeigt.
   */
  blurDataURL?: string;
  /**
   * SVGs und lokale Rohdateien benötigen next/image unoptimized=true,
   * da Next.js Image-Optimization nur Rasterformate (JPEG/WebP/AVIF) verarbeitet.
   */
  unoptimized?: boolean;
}

/**
 * Interface für jeden Medien-Provider.
 * Sprint 7 implementiert ObjectStorageProvider für dasselbe Interface.
 */
export interface MediaProvider {
  resolve(ref: MediaRef): ResolvedMedia | Promise<ResolvedMedia>;
}

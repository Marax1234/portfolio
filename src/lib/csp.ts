/**
 * Content-Security-Policy für die Frontend-Routen (B25 B4/H-08).
 *
 * Phase 1 (Session 21): nur `Content-Security-Policy-Report-Only`, Verstöße gehen an
 * `/api/csp-report` (Container-Log). Nach einer Woche ohne Verstöße wird derselbe Wert
 * als `Content-Security-Policy` gesetzt (Session 22), dann ersetzt `frame-ancestors`
 * den Header `X-Frame-Options`.
 *
 * `/admin` und `/api` bleiben ohne CSP (Payload-Admin, Live-Preview).
 * `'unsafe-inline'` bei script-src ist nötig, weil Next die RSC-Daten als Inline-Skripte
 * ausliefert; Nonces gingen nur mit dynamischem Rendering (kein ISR mehr).
 * Keine Imports mit Pfad-Alias: next.config.ts lädt diese Datei direkt.
 */

export const CSP_REPORT_PATH = "/api/csp-report";

/** Origin einer URL oder `undefined`, wenn sie fehlt oder ungültig ist. */
function originOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

export interface CspOptions {
  /** Basis-URL des Object Storage/CDN (`NEXT_PUBLIC_S3_PUBLIC_URL`). */
  mediaUrl?: string;
  /** URL des Umami-Trackers (`NEXT_PUBLIC_UMAMI_SRC`). */
  analyticsUrl?: string;
  /** `next dev` braucht `'unsafe-eval'` (React Refresh). */
  dev?: boolean;
}

export function buildCsp({ mediaUrl, analyticsUrl, dev = false }: CspOptions): string {
  const media = originOf(mediaUrl);
  const analytics = originOf(analyticsUrl);
  const list = (...values: (string | undefined | false)[]) => values.filter(Boolean).join(" ");

  const directives: [string, string][] = [
    ["default-src", "'self'"],
    ["script-src", list("'self'", "'unsafe-inline'", dev && "'unsafe-eval'", analytics)],
    ["style-src", "'self' 'unsafe-inline'"],
    ["img-src", list("'self'", "data:", "blob:", media)],
    // hls.js hängt Segmente per MediaSource (blob:) an das <video>.
    ["media-src", list("'self'", "blob:", media)],
    // hls.js lädt Playlists/Segmente per fetch/XHR, Umami sendet an /api/send.
    ["connect-src", list("'self'", media, analytics, dev && "ws:")],
    // hls.js startet seinen Transmux-Worker aus einer blob:-URL.
    ["worker-src", "'self' blob:"],
    ["font-src", "'self' data:"],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
    ["frame-ancestors", "'self'"],
    ["report-uri", CSP_REPORT_PATH],
    ["report-to", "csp"],
  ];
  return directives.map(([name, value]) => `${name} ${value}`).join("; ");
}

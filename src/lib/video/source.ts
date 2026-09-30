/**
 * Erlaubt Downloads nur vom eigenen Object Storage (transcode.ts, CodeQL js/http-to-file-access).
 *
 * Vergleicht Origin und Pfad-Präfix der geparsten URLs statt `startsWith` auf dem String:
 * Sonst ginge z. B. `https://cdn.example.de.evil.com/x.mp4` für die Basis
 * `https://cdn.example.de` durch (B25 S-07).
 */
export function isAllowedSourceUrl(sourceUrl: string, allowedBase: string | undefined): boolean {
  if (!allowedBase) return false;
  let source: URL;
  let base: URL;
  try {
    source = new URL(sourceUrl);
    base = new URL(allowedBase);
  } catch {
    return false;
  }
  if (source.username || source.password || source.origin !== base.origin) return false;
  const prefix = base.pathname.endsWith("/") ? base.pathname : `${base.pathname}/`;
  return source.pathname.startsWith(prefix);
}

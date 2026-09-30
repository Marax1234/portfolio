/**
 * Lade-Skelett (Sprint 10 — saubere Ladezustände, Konzept §6).
 *
 * Erscheint während der Server-Seiten-Hydratisierung (Suspense-Boundary
 * für jede Route in der (frontend)-Gruppe). Ruhig, token-basiert — der
 * Ladeindikator stört nicht, er hält den Raum.
 *
 * Kein Hardcode (§0.2): bg-surface-container ist eine Tailwind-Utility
 * aus @theme inline → var(--color-surface-container).
 */

export default function Loading() {
  return (
    <div
      className="container-page section-gap pb-16 animate-pulse"
      aria-busy="true"
      aria-label="Seite wird geladen"
    >
      {/* Eyebrow-Zeile */}
      <div className="h-3 w-24 rounded bg-surface-container-high mb-4" />
      {/* Headline-Platzhalter */}
      <div className="h-10 w-2/3 rounded-md bg-surface-container-high mb-4 md:h-16" />
      <div className="h-10 w-1/2 rounded-md bg-surface-container mb-8 md:h-16" />
      {/* Body-Zeilen */}
      <div className="space-y-3 max-w-prose">
        <div className="h-4 rounded bg-surface-container-high" />
        <div className="h-4 rounded bg-surface-container w-5/6" />
        <div className="h-4 rounded bg-surface-container w-4/6" />
      </div>
    </div>
  );
}

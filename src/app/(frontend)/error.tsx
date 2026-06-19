"use client";

/**
 * Error-Boundary (Sprint 10 — saubere Fehlerzustände, Konzept §6).
 *
 * Fängt unerwartete Fehler in der (frontend)-Gruppe und zeigt eine
 * kontrollierte Fehlermeldung + Reset-Option. Kein leerer/abgestürzter Screen.
 *
 * `"use client"` ist Pflicht für Error-Boundaries in Next.js App Router.
 * `reset()` versucht die Seite neu zu rendern ohne Reload.
 *
 * Kein Hardcode (§0.2).
 */

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Fehler optional in ein Monitoring-System loggen (z.B. Sentry im Deployment)
    console.error("[frontend-error]", error);
  }, [error]);

  return (
    <div className="container-page section-gap pb-16 flex flex-col items-start max-w-2xl">
      <p className="type-label-caps text-on-surface-variant mb-4">Fehler</p>

      <h1 className="type-headline-md text-on-surface mb-4">
        Da ist etwas schiefgelaufen.
      </h1>

      <p className="type-body-md text-on-surface-variant mb-8">
        Die Seite konnte nicht geladen werden. Kurz warten und nochmal versuchen
        — meistens hilft das.
      </p>

      <button
        type="button"
        onClick={reset}
        className={[
          "type-label-caps rounded-md px-6 py-3 transition-colors",
          "bg-primary text-on-primary hover:bg-primary-container",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        ].join(" ")}
      >
        Nochmal versuchen
      </button>
    </div>
  );
}

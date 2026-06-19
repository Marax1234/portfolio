/**
 * Gebrandete 404-Seite (Sprint 10 — keine Sackgassen, Konzept §6).
 *
 * Ersetzt den Next.js-Default-404 für alle (frontend)-Routen.
 * Gibt klare Weiterführung zu den Hauptbereichen — niemand landet
 * auf einer Seite ohne nächsten Schritt.
 *
 * Tone-of-Voice: trocken, erste Person, kurze Sätze (Konzept §7).
 * Kein Hardcode (§0.2): ausschließlich type-*-Klassen und Token-Utilities.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container-page section-gap pb-16 flex flex-col items-start max-w-2xl">
      <p className="type-label-caps text-on-surface-variant mb-4">404</p>

      <h1 className="type-display-lg text-on-surface mb-6">
        Hier ist nichts.
      </h1>

      <p className="type-body-lg text-on-surface-variant mb-10 max-w-prose">
        Die Seite gibt es nicht — oder nicht mehr. Kein Drama.
      </p>

      <Link
        href="/"
        className={[
          "type-label-caps rounded-md px-6 py-3 transition-colors inline-block",
          "bg-primary text-on-primary hover:bg-primary-container",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        ].join(" ")}
      >
        Zurück zur Startseite
      </Link>

      {/* Weiterführung — keine Sackgasse */}
      <nav
        aria-label="Weiterführende Seiten"
        className="mt-12 flex flex-wrap gap-6"
      >
        {[
          { href: "/arbeiten", label: "Arbeiten" },
          { href: "/journal", label: "Journal" },
          { href: "/kontakt", label: "Kontakt" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="type-label-caps text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          >
            {label} →
          </Link>
        ))}
      </nav>
    </div>
  );
}

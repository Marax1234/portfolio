/**
 * /impressum — Platzhalter-Seite (Sprint 10)
 *
 * DE-Pflicht gemäß §5 TMG (Konzept §3: „in den Footer, nicht in die Hauptnavigation").
 * Echter Text wird in diesem Seiten-File direkt eingetragen — kein CMS nötig
 * (statischer Inhalt, ändert sich nach Deployment selten).
 *
 * Layout-Utilities aus globals.css: container-page, type-*, section-gap.
 * Kein Hardcode (§0.2).
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum — Kilian Siebert",
  description: "Impressum gemäß §5 TMG / §55 RStV.",
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <div className="container-page section-gap pb-16 max-w-2xl">
      <p className="type-label-caps text-on-surface-variant mb-4">Rechtliches</p>

      <h1 className="type-headline-md text-on-surface mb-8">Impressum</h1>

      <div className="type-body-md text-on-surface-variant space-y-6">
        {/* Platzhalter — bitte vor Deployment durch echten Rechtstext ersetzen */}
        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            Angaben gemäß §5 TMG
          </h2>
          <p className="text-on-surface-variant italic">
            Inhalt folgt vor Deployment.
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            Verantwortlich für den Inhalt
          </h2>
          <p className="text-on-surface-variant italic">
            Inhalt folgt vor Deployment.
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">Kontakt</h2>
          <p>
            <a
              href="mailto:mail@kilian-siebert.de"
              className="text-primary hover:text-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              mail@kilian-siebert.de
            </a>
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link
          href="/"
          className="type-label-caps text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}

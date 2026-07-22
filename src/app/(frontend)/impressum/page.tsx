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
        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            Angaben gemäß §5 TMG
          </h2>
          <p>
            Kilian Siebert
            <br />
            <span className="italic">
              Ladungsfähige Anschrift wird nachgereicht.
            </span>
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            Verantwortlich für den Inhalt
          </h2>
          <p>
            Kilian Siebert (Anschrift wie oben)
            <br />
            gemäß §18 Abs. 2 MStV
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">Kontakt</h2>
          <p>
            <a
              href="mailto:Siebert.kilian@outlook.de"
              className="text-primary hover:text-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Siebert.kilian@outlook.de
            </a>
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            Streitschlichtung
          </h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              ec.europa.eu/consumers/odr
            </a>
            . Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle sind wir nicht verpflichtet und
            nicht bereit.
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

/**
 * /datenschutz — Platzhalter-Seite (Sprint 10)
 *
 * DE-Pflicht (DSGVO / BDSG). Echter Text wird in diesem Seiten-File
 * direkt eingetragen — kein CMS nötig.
 *
 * Layout-Utilities aus globals.css: container-page, type-*, section-gap.
 * Kein Hardcode (§0.2).
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz — Kilian Siebert",
  description: "Datenschutzerklärung gemäß DSGVO.",
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <div className="container-page section-gap pb-16 max-w-2xl">
      <p className="type-label-caps text-on-surface-variant mb-4">Rechtliches</p>

      <h1 className="type-headline-md text-on-surface mb-8">
        Datenschutzerklärung
      </h1>

      <div className="type-body-md text-on-surface-variant space-y-6">
        {/* Platzhalter — bitte vor Deployment durch echten Rechtstext ersetzen */}
        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            1. Verantwortlicher
          </h2>
          <p className="italic">Inhalt folgt vor Deployment.</p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            2. Erhobene Daten
          </h2>
          <p>
            Diese Website verwendet{" "}
            <strong>Umami</strong> für cookieloses,
            datenschutzkonformes Web-Analytics — ohne persönliche Daten,
            ohne Cross-Site-Tracking, ohne Cookie-Banner-Pflicht.
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            3. Kontaktformular
          </h2>
          <p>
            Angaben im Kontaktformular werden zur Bearbeitung der Anfrage
            gespeichert und nicht an Dritte weitergegeben.
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            4. Weitere Informationen
          </h2>
          <p className="italic">Inhalt folgt vor Deployment.</p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">Kontakt</h2>
          <p>
            <a
              href="mailto:mail@kilia-siebert.de"
              className="text-primary hover:text-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              mail@kilia-siebert.de
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

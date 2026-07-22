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
        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            1. Verantwortlicher
          </h2>
          <p>
            Kilian Siebert
            <br />
            E-Mail:{" "}
            <a
              href="mailto:Siebert.kilian@outlook.de"
              className="text-primary hover:text-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Siebert.kilian@outlook.de
            </a>
            <br />
            <span className="italic">Ladungsfähige Anschrift wird nachgereicht.</span>
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            2. Hosting &amp; Server-Logs
          </h2>
          <p>
            Diese Website wird auf eigener Infrastruktur betrieben. Beim
            Aufruf werden vom Server automatisch technische Zugriffsdaten
            (u. a. IP-Adresse, Datum/Uhrzeit, aufgerufene Seite,
            Browsertyp) für die Dauer weniger Tage protokolliert, um den
            Betrieb sicherzustellen und Missbrauch zu erkennen. Eine
            Zusammenführung mit anderen Daten findet nicht statt.
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            3. Web-Analytics (Umami)
          </h2>
          <p>
            Diese Website verwendet <strong>Umami</strong> für
            cookieloses, datenschutzkonformes Web-Analytics — ohne
            persönliche Daten, ohne Cross-Site-Tracking, ohne
            Cookie-Banner-Pflicht. Es werden keine individuellen Profile
            erstellt.
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            4. Kontaktaufnahme
          </h2>
          <p>
            Ein Kontaktformular ist aktuell nicht aktiv. Kontaktaufnahme
            erfolgt direkt per E-Mail oder Instagram-DM — die dabei von dir
            übermittelten Angaben werden ausschließlich zur Bearbeitung
            deiner Anfrage verwendet und nicht an Dritte weitergegeben. Für
            Nachrichten per Instagram-DM gilt zusätzlich die
            Datenschutzerklärung von Meta/Instagram.
          </p>
        </section>

        <section>
          <h2 className="type-label-caps text-on-surface mb-2">
            5. Deine Rechte
          </h2>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung,
            Löschung oder Einschränkung der Verarbeitung deiner
            personenbezogenen Daten sowie ein Beschwerderecht bei einer
            Datenschutz-Aufsichtsbehörde. Wende dich dazu an die oben
            genannte E-Mail-Adresse.
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

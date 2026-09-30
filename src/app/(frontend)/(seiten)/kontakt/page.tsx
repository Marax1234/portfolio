/**
 * /kontakt — Kontakt (Sprint 9, Konzept §4.6)
 *
 * Go-Live-Kurzschluss (2026-07-22): Formular vorerst deaktiviert und durch
 * direkten E-Mail/Instagram-Hinweis ersetzt — Zeitdruck vor dem Launch.
 * ContactForm.tsx + actions.ts bleiben unverändert im Repo liegen, damit das
 * Formular nach dem Launch mit einem Einzeiler (Import + JSX) reaktiviert
 * werden kann, statt es neu zu bauen.
 *
 * Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import Button, { buttonClasses } from "@/components/ui/Button";
import SplitCTA from "@/components/ui/SplitCTA";
import { SOCIAL_LINKS } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Kontakt — Kilian Siebert",
  description:
    "Hochzeit, Reise, Sport oder Marke — schreib mir per E-Mail oder Instagram-DM.",
};

const CONTACT_EMAIL = "Siebert.kilian@outlook.de";

export default function KontaktPage() {
  const instagram = SOCIAL_LINKS.find((s) => s.platform === "instagram");

  return (
    <div className="container-page section-gap-y">
      {/* Header */}
      <p className="type-label-caps text-primary mb-3">Kontakt</p>
      <h1 className="type-display-lg text-on-surface mb-4">Lass uns reden.</h1>
      <p className="type-body-lg text-on-surface-variant max-w-prose">
        Hochzeit, Abenteuer oder Marke — kein Formular, einfach kurz schreiben:
        per E-Mail oder Instagram-DM.
      </p>

      {/* Direkter Kontakt */}
      <div className="section-gap flex flex-col gap-6">
        <div className="flex flex-wrap gap-4">
          <Button href={`mailto:${CONTACT_EMAIL}`} variant="primary">
            {CONTACT_EMAIL}
          </Button>
          {instagram && (
            <a
              href={instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary")}
            >
              Instagram-DM
            </a>
          )}
        </div>

        <p className="type-body-md text-on-surface-variant">
          Ich antworte meist innerhalb von 24 h.
        </p>
      </div>

      {/* Footer-CTAs — keine Sackgasse */}
      <SplitCTA
        className="section-gap"
        left={{
          headline: "Meine Arbeiten.",
          subline: "Hochzeiten, Reisen, Sport und mehr.",
          buttonLabel: "Portfolio ansehen",
          buttonHref: "/arbeiten",
        }}
        right={{
          headline: "Kooperationen.",
          subline: "Content fuer Marken und Sponsoren.",
          buttonLabel: "Mehr erfahren",
          buttonHref: "/kooperationen",
        }}
      />
    </div>
  );
}

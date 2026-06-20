/**
 * /kontakt — Kontakt (Sprint 9, Konzept §4.6)
 *
 * Bewusst minimal: Headline, kurzes Formular, direkte Mail + Socials,
 * Erwartungs-Satz. Kein Schnickschnack — "je weniger Reibung, desto mehr
 * Anfragen" (Konzept §4.6).
 *
 * Kein Hardcode (§0.2). Formular-Logik in ContactForm.tsx (Client) +
 * actions.ts (Server Action).
 */
import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import SplitCTA from "@/components/ui/SplitCTA";
import { SOCIAL_LINKS } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Kontakt — Kilian Siebert",
  description:
    "Hochzeit, Reise, Sport oder Marke — schreib mir. Ich antworte meist innerhalb von 24 h.",
};

const CONTACT_EMAIL = "mail@kilia-siebert.de";

export default function KontaktPage() {
  return (
    <div className="container-page section-gap-y">
      {/* Header */}
      <p className="type-label-caps text-primary mb-3">Kontakt</p>
      <h1 className="type-display-lg text-on-surface mb-4">Lass uns reden.</h1>
      <p className="type-body-lg text-on-surface-variant max-w-prose">
        Hochzeit, Abenteuer oder Marke — schreib mir kurz, worum es geht.
      </p>

      {/* Formular */}
      <ContactForm />

      {/* Direkte Kontaktzeile */}
      <div className="section-gap flex flex-col gap-4">
        <p className="type-label-caps text-on-surface-variant">oder direkt</p>
        <Link
          href={`mailto:${CONTACT_EMAIL}`}
          className="type-body-lg text-primary hover:underline underline-offset-4"
        >
          {CONTACT_EMAIL}
        </Link>

        {/* Socials (Platzhalter bis Sprint 10 befuellt) */}
        {SOCIAL_LINKS.some((s) => s.href !== "#") && (
          <div className="flex gap-6">
            {SOCIAL_LINKS.filter((s) => s.href !== "#").map((s) => (
              <Link
                key={s.platform}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="type-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}

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

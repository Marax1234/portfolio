/**
 * /kooperationen — Kooperationen / Sponsoren (Sprint 9, Konzept §4.5)
 *
 * Seite richtet sich direkt und sachlich an Marken/Sponsoren.
 * Struktur (Konzept §4.5, top-down):
 *   1. Einleitung — was du fuer Marken machst
 *   2. Was ich biete / Fuer wen — zwei Spalten
 *   3. Reichweite / Audience — FactsStrip (nur wenn Zahlen vorhanden)
 *   4. Bisherige Kooperationen — Logos/Kurzbeschreibungen
 *   5. CTA-Zeile: Media-Kit-Download + Anfrage-CTA
 *   6. Footer-SplitCTA — keine Sackgasse
 *
 * Inhalt ist bewusst schlank bis echte Reichweite-Daten vorliegen.
 * Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import type { Document, Media as MediaType } from "@/payload-types";
import Media from "@/components/Media";
import Button, { buttonClasses } from "@/components/ui/Button";
import FactsStrip from "@/components/ui/FactsStrip";
import SplitCTA from "@/components/ui/SplitCTA";
import { payloadMediaRef } from "@/lib/media";
import { getCooperationsPage } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Kooperationen — Kilian Siebert",
  description:
    "Content-Produktion fuer Marken und Sponsoren — Outdoor, Sport, Reise. Media-Kit auf Anfrage.",
};

export default async function KooperationenPage() {
  const coop = await getCooperationsPage();

  // Media-Kit-URL aus dem verknuepften Dokument (depth: 1 → populiertes Objekt)
  const mediaKitDoc =
    typeof coop.mediaKit === "object" && coop.mediaKit !== null
      ? (coop.mediaKit as Document)
      : null;
  const mediaKitUrl = mediaKitDoc?.url ?? null;
  const mediaKitLabel = coop.mediaKitLabel ?? "Media-Kit herunterladen";

  return (
    <div className="container-page section-gap-y">
      {/* Header */}
      <p className="type-label-caps text-primary mb-3">Kooperationen</p>
      <h1 className="type-display-lg text-on-surface mb-8">Zusammenarbeit.</h1>

      {/* 1. Einleitung */}
      {coop.intro ? (
        <p className="type-body-lg text-on-surface max-w-prose">{coop.intro}</p>
      ) : (
        <p className="type-body-lg text-on-surface-variant max-w-prose">
          Ich erstelle Bild- und Video-Content fuer Marken, die etwas zu zeigen haben.
          Outdoor, Sport, Reise — Produkte, die sich in Bewegung erklaeren.
        </p>
      )}

      {/* 2. Was ich biete / Fuer wen */}
      {((coop.services && coop.services.length > 0) ||
        (coop.industries && coop.industries.length > 0)) && (
        <section className="section-gap">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Services */}
            <div>
              <h2 className="type-headline-md text-on-surface mb-6">Was ich biete</h2>
              <ul className="flex flex-col gap-3">
                {(coop.services ?? []).map((s) => (
                  <li key={s.id ?? s.item} className="type-body-md text-on-surface flex gap-3">
                    <span className="text-primary select-none" aria-hidden>
                      —
                    </span>
                    {s.item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fuer wen */}
            <div>
              <h2 className="type-headline-md text-on-surface mb-6">Fuer wen</h2>
              <ul className="flex flex-col gap-3">
                {(coop.industries ?? []).map((i) => (
                  <li key={i.id ?? i.item} className="type-body-md text-on-surface flex gap-3">
                    <span className="text-primary select-none" aria-hidden>
                      —
                    </span>
                    {i.item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 3. Reichweite — FactsStrip (nur wenn Zahlen befuellt) */}
      {coop.reachFacts && coop.reachFacts.length > 0 && (
        <section className="section-gap">
          <h2 className="type-headline-md text-on-surface mb-8">Reichweite</h2>
          <FactsStrip
            facts={coop.reachFacts.map(({ value, label }) => ({ value, label }))}
          />
        </section>
      )}

      {/* 4. Bisherige Kooperationen */}
      {coop.priorCooperations && coop.priorCooperations.length > 0 && (
        <section className="section-gap">
          <h2 className="type-headline-md text-on-surface mb-8">Bisherige Kooperationen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {coop.priorCooperations.map((c) => {
              const logoRef = payloadMediaRef(c.logo as MediaType | number | null | undefined, {
                alt: c.name,
              });
              return (
                <div
                  key={c.id ?? c.name}
                  className="rounded-xl border border-outline-variant p-6 flex flex-col gap-4"
                >
                  {logoRef && (
                    <div className="relative w-24 h-12 overflow-hidden rounded">
                      <Media
                        {...logoRef}
                        className="absolute inset-0 w-full h-full"
                        imageClassName="object-contain w-full h-full"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <div>
                    <p className="type-body-lg text-on-surface">{c.name}</p>
                    {c.note && (
                      <p className="type-body-md text-on-surface-variant mt-1">{c.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. CTA-Zeile: Media-Kit + Anfrage */}
      <div className="section-gap flex flex-wrap gap-4">
        {mediaKitUrl ? (
          <a href={mediaKitUrl} download className={buttonClasses("secondary")}>
            {mediaKitLabel}
          </a>
        ) : (
          <p className="type-body-md text-on-surface-variant">
            Media-Kit auf Anfrage verfuegbar.
          </p>
        )}
        <Button href="/kontakt" variant="primary">
          Kooperation anfragen
        </Button>
      </div>

      {/* 6. Footer-CTAs — keine Sackgasse */}
      <SplitCTA
        className="section-gap"
        left={{
          headline: "Projekt anfragen.",
          subline: "Hochzeit, Reise oder Event — ich freue mich von dir zu hoeren.",
          buttonLabel: "Kontakt",
          buttonHref: "/kontakt",
        }}
        right={{
          headline: "Meine Arbeiten.",
          subline: "Bildwelten aus Sport, Reise und Hochzeiten.",
          buttonLabel: "Portfolio ansehen",
          buttonHref: "/arbeiten",
        }}
      />
    </div>
  );
}

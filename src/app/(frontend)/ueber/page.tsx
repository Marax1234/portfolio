/**
 * /ueber — Über mich (Sprint 5, Konzept §4.3)
 *
 * Reihenfolge: großes Portrait-/Action-Bild → Story-Text (erste Person,
 * ohne Pathos) → Meilenstein-Timeline (sportlich + kreativ gemischt) →
 * „Was mich ausmacht" (Stichworte) → Backstage-Grid → Footer-CTAs
 * („Mehr im Journal" / „Kontakt") — keine Sackgasse.
 *
 * Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import Media from "@/components/Media";
import RichText from "@/components/RichText";
import SplitCTA from "@/components/ui/SplitCTA";
import { payloadMediaRef } from "@/lib/media";
import { getAboutPage } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Über mich — Kilian Siebert",
  description: "Wer ich bin, woher ich komme, warum Kamera und Sport.",
};

export default async function UeberPage() {
  const about = await getAboutPage();
  const heroRef = payloadMediaRef(about.hero?.image, { alt: about.hero?.headline ?? "Kilian Siebert" });

  return (
    <div className="container-page section-gap-y">
      {/* Hero — großes Portrait-/Action-Bild */}
      <p className="type-label-caps text-primary mb-3">{about.hero?.eyebrow ?? "Über mich"}</p>
      <h1 className="type-display-lg text-on-surface mb-8">{about.hero?.headline ?? "Kilian Siebert"}</h1>
      <div className="relative w-full overflow-hidden rounded-xl mb-12" style={{ aspectRatio: "4 / 3" }}>
        <Media
          {...(heroRef ?? { id: "placeholder" })}
          priority
          className="absolute inset-0 w-full h-full"
          imageClassName="object-cover w-full h-full"
          sizes="100vw"
        />
      </div>

      {/* Story-Text — 3-4 Absätze, erste Person */}
      {about.story && <RichText data={about.story} className="type-body-lg text-on-surface max-w-prose" />}

      {/* Meilenstein-Timeline — Jahr in eigener Spalte links der Schiene,
          Marker exakt auf der Linie, großzügiger vertikaler Rhythmus. */}
      {about.milestones && about.milestones.length > 0 && (
        <section className="section-gap-tight max-w-2xl">
          <h2 className="type-headline-md text-on-surface mb-10">Meilensteine</h2>
          <ol className="flex flex-col">
            {about.milestones.map((milestone) => (
              <li
                key={milestone.id ?? `${milestone.year}-${milestone.title}`}
                className="grid grid-cols-[3rem_1fr] gap-x-5 sm:grid-cols-[4.5rem_1fr] sm:gap-x-8"
              >
                {/* Jahr — rechtsbündig zur Schiene, mit dem Titel auf einer Linie */}
                <p className="type-label-caps text-primary text-right tabular-nums pt-[0.3em]">
                  {milestone.year}
                </p>
                {/* Durchgehende Schiene via Border + Padding-bottom; letzter
                    Eintrag ohne Überhang. */}
                <div className="relative border-l-2 border-outline-variant pl-6 pb-10 last:pb-0 sm:pl-8">
                  <span className="timeline-marker rounded-sm bg-primary" aria-hidden="true" />
                  <p className="type-body-lg text-on-surface">{milestone.title}</p>
                  {milestone.description && (
                    <p className="type-body-md text-on-surface-variant mt-1.5">{milestone.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Was mich ausmacht */}
      {about.whatDefinesMe && about.whatDefinesMe.length > 0 && (
        <section className="section-gap-tight">
          <h2 className="type-headline-md text-on-surface mb-8">Was mich ausmacht</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {about.whatDefinesMe.map((point, index) => (
              <div
                key={point.id ?? point.point}
                className={`rounded-md border border-outline bg-surface-container-lowest p-6 ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <p className="type-body-lg text-on-surface">{point.point}</p>
                {point.description && (
                  <p className="type-body-md text-on-surface-variant mt-2">{point.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Backstage-Grid — lockerer Grid, „den Menschen greifen". Jede Kachel
          trägt einen ungefähren Zeitraum (immer sichtbar) und eine kurze
          Beschreibung, die beim Hovern/Fokus aufgeht; das Bild zoomt dezent. */}
      {about.backstage && about.backstage.length > 0 && (
        <section className="section-gap-tight">
          <h2 className="type-headline-md text-on-surface mb-3">Backstage</h2>
          <p className="type-body-md text-on-surface-variant mb-10 max-w-prose">
            Zwischen den Bildern — Orte, Momente und der Weg dahin.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {about.backstage.flatMap((entry) => {
              const ref = payloadMediaRef(entry.image, { alt: entry.caption ?? "Backstage" });
              if (!ref) return [];
              const hasMeta = Boolean(entry.period || entry.caption);
              return [
                <figure
                  key={entry.id ?? JSON.stringify(entry)}
                  className="group relative w-full overflow-hidden rounded-lg bg-surface-container"
                  style={{ aspectRatio: "4 / 5" }}
                >
                  <Media
                    {...ref}
                    alt={entry.caption ?? "Backstage"}
                    className="absolute inset-0 w-full h-full"
                    imageClassName="object-cover w-full h-full transition-transform duration-500 ease-[var(--ease-out-strong)] motion-reduce:transition-none group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {hasMeta && (
                    <>
                      <div
                        className="media-scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-80 transition-opacity duration-300 motion-reduce:transition-none group-hover:h-2/3 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        {entry.caption && (
                          <p className="type-body-md text-inverse-on-surface translate-y-1 opacity-0 transition-all duration-300 ease-[var(--ease-out-strong)] motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                            {entry.caption}
                          </p>
                        )}
                        {entry.period && (
                          <p className="type-label-caps text-inverse-on-surface mt-1.5">{entry.period}</p>
                        )}
                      </figcaption>
                    </>
                  )}
                </figure>,
              ];
            })}
          </div>
        </section>
      )}

      {/* Footer-CTAs — keine Sackgasse */}
      <SplitCTA
        className="section-gap"
        left={{ headline: "Mehr im Journal.", buttonLabel: "Zum Journal", buttonHref: "/journal" }}
        right={{ headline: "Projekt anfragen.", buttonLabel: "Kontakt", buttonHref: "/kontakt" }}
      />
    </div>
  );
}

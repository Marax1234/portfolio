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

      {/* Meilenstein-Timeline */}
      {about.milestones && about.milestones.length > 0 && (
        <section className="section-gap-tight">
          <h2 className="type-headline-md text-on-surface mb-8">Meilensteine</h2>
          <ol className="flex flex-col gap-6 border-l-2 border-outline pl-6">
            {about.milestones.map((milestone) => (
              <li
                key={milestone.id ?? `${milestone.year}-${milestone.title}`}
                className="relative"
              >
                <span className="timeline-marker rounded-sm bg-primary" aria-hidden="true" />
                <p className="type-label-caps text-base text-primary mb-1">{milestone.year}</p>
                <p className="type-body-md text-on-surface">{milestone.title}</p>
                {milestone.description && (
                  <p className="type-body-md text-on-surface-variant mt-1">{milestone.description}</p>
                )}
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

      {/* Backstage-Grid — lockerer Grid, „den Menschen greifen" */}
      {about.backstage && about.backstage.length > 0 && (
        <section className="section-gap-tight">
          <h2 className="type-headline-md text-on-surface mb-8">Backstage</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {about.backstage.flatMap((entry) => {
              const ref = payloadMediaRef(entry.image, { alt: "Backstage" });
              if (!ref) return [];
              return [
                <div
                  key={entry.id ?? JSON.stringify(entry)}
                  className="relative w-full overflow-hidden rounded-sm"
                  style={{ aspectRatio: "1 / 1" }}
                >
                  <Media
                    {...ref}
                    className="absolute inset-0 w-full h-full"
                    imageClassName="object-cover w-full h-full"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>,
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

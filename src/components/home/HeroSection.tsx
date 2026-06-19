/**
 * HeroSection — Vollbild-Hero der Startseite (Sprint 3)
 *
 * Konzept §4.1: „VOLLBILD-VIDEO-LOOP (Reel-Cut) — Bewegung/Sport/Reise
 * gemischt." Sprint 3 zeigt das Standbild/Poster; Sprint 8 ersetzt den
 * markierten Slot durch den echten HLS-Video-Loop (Komponente bleibt
 * unverändert, siehe data-video-slot unten).
 *
 * design.md §Video-Loop Components: edge-to-edge, kein Rand, dezenter
 * Mist-Blue-Tint zur Vereinheitlichung mit der Pastell-Palette.
 *
 * Sitzt bündig unter dem (anfangs transparenten) Sticky-Header: negativer
 * Top-Margin in Höhe von --header-height holt den Hero unter den Header.
 *
 * Sprint 5: Inhalte kommen aus `SiteConfig.hero` (Payload) — Props haben
 * weiterhin Sprint-3-Platzhalter als Default, falls das Global (noch) leer ist.
 *
 * Kein Hardcode (§0.2).
 */

import Media from "@/components/Media";
import VideoLoop from "@/components/VideoLoop";
import type { AnyMediaRef, ResolvedVideo } from "@/lib/media";

interface HeroSectionProps {
  eyebrow?: string;
  name?: string;
  tagline?: string;
  scrollHint?: string;
  poster?: AnyMediaRef;
  /** Aufgelöstes Video (status=ready). Fehlt: nur Poster-Bild. */
  video?: ResolvedVideo;
}

export default function HeroSection({
  eyebrow = "Fotograf & Videograf",
  name = "Kilian Siebert",
  tagline = "Ich filme das, was sich zu erleben lohnt — auf dem Rad genauso wie auf einer Hochzeit.",
  scrollHint = "↓ Scrollen",
  poster,
  video,
}: HeroSectionProps) {
  return (
    <section
      className="relative w-full overflow-hidden min-h-screen flex items-end"
      style={{ marginTop: "calc(-1 * var(--header-height))" }}
    >
      {/*
       * Video-Loop-Slot (Sprint 8):
       * Dieser Wrapper wird in Sprint 8 durch den HLS-Player ersetzt.
       * Bis dahin: <Media id="hero-poster"> als Poster-/Standbild-Fallback.
       * data-video-slot markiert die Stelle eindeutig für die Übergabe.
       */}
      <div
        data-video-slot="hero"
        className="absolute inset-0 w-full h-full"
      >
        {video ? (
          /*
           * Sprint 8: HLS-Video-Loop (VideoLoop kümmert sich selbst um
           * Mist-Blue-Tint und lazy-load).
           */
          <VideoLoop
            video={video}
            posterSrc={video.posterUrl}
            posterAlt={video.alt}
            variant="hero"
          />
        ) : (
          /*
           * Fallback: Poster-Standbild (wie Sprint 3–7).
           * Tint und Scrim bleiben — auch wenn kein Video gesetzt ist.
           */
          <Media
            {...(poster ?? { id: "hero-poster" })}
            priority
            sizes="100vw"
            className="absolute inset-0 w-full h-full"
            imageClassName="object-cover w-full h-full"
          />
        )}

        {/* Redesign „härtere Kanten": Mist-Blue-Pastell-Tint entfällt —
            das Bild bleibt unverwaschen/kontrastreich. Scrim bleibt (Lesbarkeit). */}

        {/* Lesbarkeits-Scrim für den Overlay-Text unten */}
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent" />
      </div>

      {/* Overlay-Text */}
      <div className="relative z-10 container-page pb-16 md:pb-24">
        <p className="type-label-caps text-inverse-on-surface/80 mb-4">{eyebrow}</p>
        <h1 className="type-display-lg text-inverse-on-surface">{name}</h1>
        <p className="type-body-lg text-inverse-on-surface/90 mt-4 max-w-md">{tagline}</p>
        <p className="type-label-caps text-inverse-on-surface/70 mt-12">{scrollHint}</p>
      </div>
    </section>
  );
}

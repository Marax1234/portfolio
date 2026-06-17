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
 * Kein Hardcode (§0.2).
 */

import Media from "@/components/Media";

export default function HeroSection() {
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
        aria-label="Platzhalter für Hero-Video-Loop (Sprint 8)"
      >
        <Media
          id="hero-poster"
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full"
          imageClassName="object-cover w-full h-full"
        />

        {/* Mist-Blue-Tint (10–15%, design.md §Video-Loop Components) */}
        <div className="absolute inset-0 bg-mist-blue/15" />

        {/* Lesbarkeits-Scrim für den Overlay-Text unten */}
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent" />
      </div>

      {/* Overlay-Text */}
      <div className="relative z-10 container-page pb-16 md:pb-24">
        <p className="type-label-caps text-inverse-on-surface/80 mb-4">
          Fotograf &amp; Videograf
        </p>
        <h1 className="type-display-lg text-inverse-on-surface">
          Kilian Siebert
        </h1>
        <p className="type-body-lg text-inverse-on-surface/90 mt-4 max-w-md">
          Ich filme das, was sich zu erleben lohnt — auf dem Rad genauso
          wie auf einer Hochzeit.
        </p>
        <p className="type-label-caps text-inverse-on-surface/70 mt-12">
          ↓ Scrollen
        </p>
      </div>
    </section>
  );
}

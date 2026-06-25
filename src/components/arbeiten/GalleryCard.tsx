"use client";

/**
 * GalleryCard — eine Kachel der Masonry-Galerie auf /arbeiten (Redesign Sprint).
 *
 * Konzept-Redesign: cleaner, dynamischer, minimalistisch. Kein harter Rahmen,
 * kein dauerhafter Text-Blocker mehr — die Beschriftung (Titel + Mini-Info)
 * taucht erst beim Hovern auf, getragen von einem dezenten Boden-Schleier
 * (`media-scrim-bottom`, gleiche Sprache wie die Backstage-Galerie auf /ueber).
 *
 * Das Cover wird server-seitig als <Media>-Node gerendert und hier als
 * `media`-Prop hereingereicht — diese Client-Komponente instanziiert also
 * keine Server-Komponente (RSC-Grenze, §0.5), sondern animiert nur die Hülle:
 *
 *   • Eintritt:   fade + slide-up beim Scrollen in den Viewport (Motion,
 *                 `whileInView` einmalig, reduced-motion-sicher).
 *   • Laden:      animierter Skeleton-Platzhalter bis das <img> geladen ist,
 *                 danach blendet das Bild sanft von opacity 0 → 1 ein.
 *   • Hover:      dezenter Zoom (scale 1.02) + Schleier + Beschriftung.
 *
 * Natürliches Seitenverhältnis (`h-auto`) — Hoch- und Querformat ohne Crop,
 * der Masonry-Fluss (CSS columns) ordnet die Höhen.
 *
 * Kein Hardcode (§0.2): nur Tokens/Utilities und CSS-Variablen.
 */

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

interface GalleryCardProps {
  title: string;
  meta?: string;
  href: string;
  /** Server-gerenderter <Media>-Node (Cover). */
  media: ReactNode;
}

// Entspricht --ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1)
const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

export default function GalleryCard({ title, meta, href, media }: GalleryCardProps) {
  const reduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  /**
   * Lade-Erkennung ohne Eingriff in die Server-Komponente <Media>: wir greifen
   * das gerenderte <img> per Ref ab. Ist es beim Mount schon im Cache (`complete`),
   * fällt der Skeleton sofort; sonst horchen wir auf `load`. `error` blendet den
   * Skeleton ebenfalls aus, damit keine Kachel im Lade-Zustand hängenbleibt.
   */
  useEffect(() => {
    const img = wrapperRef.current?.querySelector("img");
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      return;
    }

    const reveal = () => setLoaded(true);
    img.addEventListener("load", reveal);
    img.addEventListener("error", reveal);
    return () => {
      img.removeEventListener("load", reveal);
      img.removeEventListener("error", reveal);
    };
  }, []);

  return (
    <motion.div
      className="mb-4 break-inside-avoid sm:mb-6"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: EASE_OUT_STRONG }}
    >
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-xl bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {/* Bild-Box — natürliches Seitenverhältnis, dezenter Hover-Zoom */}
        <div
          ref={wrapperRef}
          className={[
            "relative w-full transition-transform duration-500 ease-[var(--ease-out-strong)] motion-reduce:transition-none group-hover:scale-[1.02]",
            "[&_img]:block [&_img]:h-auto [&_img]:w-full",
            "[&_img]:transition-opacity [&_img]:duration-700 [&_img]:ease-[var(--ease-out-strong)] motion-reduce:[&_img]:transition-none",
            loaded ? "[&_img]:opacity-100" : "[&_img]:opacity-0",
          ].join(" ")}
        >
          {/* Skeleton-Platzhalter — pulsiert bis das Bild geladen ist */}
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-0 z-10 bg-surface-container-high",
              "transition-opacity duration-500 motion-reduce:transition-none",
              loaded ? "opacity-0" : "animate-pulse opacity-100",
            ].join(" ")}
          />
          {media}
        </div>

        {/* Boden-Schleier — trägt die Schrift, taucht beim Hovern auf */}
        <div
          aria-hidden="true"
          className="media-scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-0 transition-opacity duration-300 ease-[var(--ease-out-strong)] motion-reduce:transition-none group-hover:opacity-100"
        />

        {/* Minimalistische Beschriftung — Hover-Reveal */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="type-body-lg translate-y-2 text-inverse-on-surface opacity-0 transition-all duration-300 ease-[var(--ease-out-strong)] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none">
            {title}
          </h3>
          {meta && (
            <p className="type-label-caps mt-1.5 translate-y-2 text-inverse-on-surface opacity-0 transition-all delay-75 duration-300 ease-[var(--ease-out-strong)] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none">
              {meta}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * WhatIDoSection — „Was ich mache", 3 Kacheln (Sprint 3)
 *
 * Konzept §4.1: „Drei Kacheln lassen jeden Besuchertyp seinen Bereich
 * finden, ohne Menü-Drilldown." Alle drei führen vorerst auf /arbeiten
 * (Filter-Tabs nach Kategorie folgen erst mit der echten Arbeiten-Seite,
 * Sprint 5). Hover-Video-Snippets (Konzept §4.1) sind Sprint 8.
 *
 * Sprint 5: Kacheln + Überschrift kommen aus `SiteConfig.whatIDoTiles`/
 * `SiteConfig.whatIDo` (Payload). Ohne Inhalte greifen die
 * Sprint-3-Platzhalter-Kacheln als Fallback.
 *
 * Kein Hardcode (§0.2).
 */

import Link from "next/link";
import Media from "@/components/Media";
import type { AnyMediaRef } from "@/lib/media";

interface Tile {
  key: string;
  label: string;
  href: string;
  ref: AnyMediaRef;
  refColor?: AnyMediaRef;
}

const FALLBACK_TILES: Tile[] = [
  { key: "tile-menschen", label: "Menschen", href: "/arbeiten", ref: { id: "tile-menschen" } },
  { key: "tile-reisen", label: "Reisen", href: "/arbeiten", ref: { id: "tile-reisen" } },
  { key: "tile-sport", label: "Sport", href: "/arbeiten", ref: { id: "tile-sport" } },
];

interface WhatIDoSectionProps {
  eyebrow?: string;
  headline?: string;
  tiles?: Tile[];
  className?: string;
}

export default function WhatIDoSection({
  eyebrow = "Was ich mache",
  headline = "Menschen, Reisen, Sport.",
  tiles = FALLBACK_TILES,
  className = "",
}: WhatIDoSectionProps) {
  return (
    <section className={className}>
      <h2 className="type-headline-md text-primary mb-3">{eyebrow}</h2>
      <p className="type-body-md text-on-surface-variant mb-8">{headline}</p>

      {/* Redesign „Anti-Slop": kein 3-gleiche-Kacheln-Grid mehr — erste
          Kachel führt (2 Zeilen hoch), die übrigen stapeln sich daneben. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiles.map(({ key, label, href, ref, refColor }, index) => (
          <Link
            key={key}
            href={href}
            className={[
              "group relative block w-full shadow-ambient",
              index === 0 ? "aspect-[4/5] md:aspect-auto md:row-span-2 md:h-full" : "aspect-square",
            ].join(" ")}
          >
            <div className="relative w-full h-full overflow-hidden rounded-none border border-outline-variant">
              {refColor ? (
                /* Gemeinsamer Zoom-Wrapper: beide Bilder teilen sich EINEN
                   durchgehenden Ran-Zoom (wie im Ein-Bild-Fall). Nur das
                   Farbbild blendet langsam darüber — so kein abgehackter
                   Sprung, wenn die Farbe dazukommt. */
                <div className="absolute inset-0 transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-105">
                  <Media
                    {...ref}
                    alt={label}
                    className="absolute inset-0 w-full h-full"
                    imageClassName="object-cover w-full h-full"
                    sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                  />
                  <Media
                    {...refColor}
                    alt={label}
                    className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none group-hover:opacity-100"
                    imageClassName="object-cover w-full h-full"
                    sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                  />
                </div>
              ) : (
                <Media
                  {...ref}
                  alt={label}
                  className="absolute inset-0 w-full h-full"
                  imageClassName="object-cover w-full h-full transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-105"
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/50 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 type-label-caps text-inverse-on-surface">
                {label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

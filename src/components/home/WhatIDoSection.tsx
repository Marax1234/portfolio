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
      <p className="type-label-caps text-primary mb-3">{eyebrow}</p>
      <h2 className="type-headline-md text-on-surface mb-8">{headline}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {tiles.map(({ key, label, href, ref }) => (
          <Link
            key={key}
            href={href}
            className="group relative block w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: "1 / 1" }}
          >
            <Media
              {...ref}
              alt={label}
              className="absolute inset-0 w-full h-full"
              imageClassName="object-cover w-full h-full transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/50 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 type-label-caps text-inverse-on-surface">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * WhatIDoSection — „Was ich mache", 3 Kacheln (Sprint 3)
 *
 * Konzept §4.1: „Drei Kacheln lassen jeden Besuchertyp seinen Bereich
 * finden, ohne Menü-Drilldown." Alle drei führen vorerst auf /arbeiten
 * (Filter-Tabs nach Kategorie folgen erst mit der echten Arbeiten-Seite,
 * Sprint 5). Hover-Video-Snippets (Konzept §4.1) sind Sprint 8.
 *
 * Kein Hardcode (§0.2).
 */

import Link from "next/link";
import Media from "@/components/Media";

interface Tile {
  id: string;
  label: string;
}

const TILES: Tile[] = [
  { id: "tile-menschen", label: "Menschen" },
  { id: "tile-reisen", label: "Reisen" },
  { id: "tile-sport", label: "Sport" },
];

interface WhatIDoSectionProps {
  className?: string;
}

export default function WhatIDoSection({ className = "" }: WhatIDoSectionProps) {
  return (
    <section className={className}>
      <p className="type-label-caps text-primary mb-3">Was ich mache</p>
      <h2 className="type-headline-md text-on-surface mb-8">
        Menschen, Reisen, Sport.
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {TILES.map(({ id, label }) => (
          <Link
            key={id}
            href="/arbeiten"
            className="group relative block w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: "1 / 1" }}
          >
            <Media
              id={id}
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

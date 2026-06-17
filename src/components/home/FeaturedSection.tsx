/**
 * FeaturedSection — ein einzelnes, großflächiges Highlight (Sprint 3)
 *
 * Konzept §4.1: „FEATURED — bestes/neuestes Projekt — ein einzelnes
 * Highlight, großflächig." Bild ist Hauptsache, Text ist Beilage
 * (Konzept §4.2).
 *
 * Kein Hardcode (§0.2).
 */

import Media from "@/components/Media";
import Button from "@/components/ui/Button";

interface FeaturedSectionProps {
  className?: string;
}

export default function FeaturedSection({ className = "" }: FeaturedSectionProps) {
  return (
    <section className={className}>
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 10" }}>
        <Media
          id="featured"
          alt="Triathlon EM 2024 — Hamburg"
          className="absolute inset-0 w-full h-full"
          imageClassName="object-cover w-full h-full"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 via-inverse-surface/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 max-w-xl">
          <p className="type-label-caps text-inverse-on-surface/80 mb-3">Featured</p>
          <h2 className="type-headline-md text-inverse-on-surface mb-3">
            Triathlon EM 2024 — Hamburg
          </h2>
          <p className="type-body-md text-inverse-on-surface/90 mb-6">
            Drei Disziplinen, ein Tag, ein Team vor Ort. Die Strecke war
            nass, das Tempo nicht.
          </p>
          <Button href="/arbeiten" variant="primary">
            Projekt ansehen
          </Button>
        </div>
      </div>
    </section>
  );
}

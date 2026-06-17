/**
 * FeaturedSection — ein einzelnes, großflächiges Highlight (Sprint 3)
 *
 * Konzept §4.1: „FEATURED — bestes/neuestes Projekt — ein einzelnes
 * Highlight, großflächig." Bild ist Hauptsache, Text ist Beilage
 * (Konzept §4.2).
 *
 * Sprint 5: Inhalte kommen aus dem featured `Project` (Payload). Ohne
 * featured Projekt greift der Sprint-3-Platzhalter als Fallback.
 *
 * Kein Hardcode (§0.2).
 */

import Media from "@/components/Media";
import Button from "@/components/ui/Button";
import type { AnyMediaRef } from "@/lib/media";

interface FeaturedSectionProps {
  cover?: AnyMediaRef;
  title?: string;
  excerpt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export default function FeaturedSection({
  cover,
  title = "Triathlon EM 2024 — Hamburg",
  excerpt = "Drei Disziplinen, ein Tag, ein Team vor Ort. Die Strecke war nass, das Tempo nicht.",
  ctaLabel = "Projekt ansehen",
  ctaHref = "/arbeiten",
  className = "",
}: FeaturedSectionProps) {
  return (
    <section className={className}>
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 10" }}>
        <Media
          {...(cover ?? { id: "featured" })}
          alt={title}
          className="absolute inset-0 w-full h-full"
          imageClassName="object-cover w-full h-full"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 via-inverse-surface/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 max-w-xl">
          <p className="type-label-caps text-inverse-on-surface/80 mb-3">Featured</p>
          <h2 className="type-headline-md text-inverse-on-surface mb-3">{title}</h2>
          {excerpt && (
            <p className="type-body-md text-inverse-on-surface/90 mb-6">{excerpt}</p>
          )}
          <Button href={ctaHref} variant="primary">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

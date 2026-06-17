/**
 * IntroSection — „Ich in einem Absatz" (Sprint 3)
 *
 * Konzept §4.1: „Intro vor Portfolio. Der ‚Ich in einem Absatz'-Block
 * stellt die Person vor die Dienstleistung." Asymmetrischer Split
 * (design.md §Layout: „Split-Konfigurationen, off-center").
 *
 * Tone of Voice §7: trocken, konkret, erste Person, zeigen statt behaupten.
 *
 * Sprint 5: Inhalte kommen aus `SiteConfig.intro` (Payload). Ohne `body`
 * (Global noch leer) greift der Sprint-3-Platzhaltertext als Fallback.
 *
 * Kein Hardcode (§0.2).
 */

import Media from "@/components/Media";
import RichText from "@/components/RichText";
import type { AnyMediaRef } from "@/lib/media";

interface IntroSectionProps {
  eyebrow?: string;
  portrait?: AnyMediaRef;
  body?: { root: unknown; [k: string]: unknown } | null;
  className?: string;
}

const FALLBACK_BODY = (
  <p className="type-body-lg text-on-surface max-w-prose">
    Ich bin Kilian — seit 2021 mit der Kamera unterwegs, seit länger
    auf dem Rad. Triathlon hat mir gezeigt, wie weit man kommt, wenn
    man dranbleibt. Genau das suche ich auch hinter der Kamera: keine
    gestellten Momente, sondern das, was wirklich passiert. Hochzeit,
    Wettkampf oder 14 Länder unterwegs — am Ende geht es immer um
    dasselbe: festhalten, was sich zu erleben lohnt.
  </p>
);

export default function IntroSection({
  eyebrow = "Über mich",
  portrait,
  body,
  className = "",
}: IntroSectionProps) {
  return (
    <section className={["grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center", className].join(" ")}>
      {/* Portrait — 2 von 5 Spalten auf Desktop */}
      <div className="md:col-span-2">
        <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 5" }}>
          <Media
            {...(portrait ?? { id: "portrait" })}
            alt="Kilian Siebert"
            className="absolute inset-0 w-full h-full"
            imageClassName="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>

      {/* Text — 3 von 5 Spalten auf Desktop */}
      <div className="md:col-span-3">
        <p className="type-label-caps text-primary mb-4">{eyebrow}</p>
        {body ? <RichText data={body} className="type-body-lg text-on-surface max-w-prose" /> : FALLBACK_BODY}
      </div>
    </section>
  );
}

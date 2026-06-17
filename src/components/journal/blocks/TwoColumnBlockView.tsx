import Media from "@/components/Media";
import { payloadMediaRef } from "@/lib/media";
import type { TwoColumnBlock } from "@/payload-types";

/** Zwei-Spalten-Block — zwei Bilder nebeneinander (Vergleich/Paar-Motiv). */
export default function TwoColumnBlockView({ left, leftCaption, right, rightCaption }: TwoColumnBlock) {
  const leftRef = payloadMediaRef(left, { alt: leftCaption ?? undefined });
  const rightRef = payloadMediaRef(right, { alt: rightCaption ?? undefined });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { ref: leftRef, caption: leftCaption, key: "left" },
        { ref: rightRef, caption: rightCaption, key: "right" },
      ].map(({ ref, caption, key }) =>
        ref ? (
          <figure key={key}>
            <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 5" }}>
              <Media
                {...ref}
                className="absolute inset-0 w-full h-full"
                imageClassName="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {caption && <figcaption className="type-label-caps text-on-surface-variant mt-3">{caption}</figcaption>}
          </figure>
        ) : null,
      )}
    </div>
  );
}

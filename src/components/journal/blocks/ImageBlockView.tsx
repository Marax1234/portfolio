import Media from "@/components/Media";
import { payloadMediaRef } from "@/lib/media";
import type { ImageBlock } from "@/payload-types";

/** Vollbild-Bild-Block — volle Breite, wie die Galerie-Strecke auf Projekt-Detailseiten. */
export default function ImageBlockView({ image, caption }: ImageBlock) {
  const ref = payloadMediaRef(image, { alt: caption ?? undefined });
  if (!ref) return null;

  return (
    <figure>
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 10" }}>
        <Media {...ref} className="absolute inset-0 w-full h-full" imageClassName="object-cover w-full h-full" sizes="100vw" />
      </div>
      {caption && <figcaption className="type-label-caps text-on-surface-variant mt-3">{caption}</figcaption>}
    </figure>
  );
}

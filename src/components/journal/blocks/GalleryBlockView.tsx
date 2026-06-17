import Media from "@/components/Media";
import { payloadMediaRef } from "@/lib/media";
import type { GalleryBlock } from "@/payload-types";

/** Galerie-Block — responsives Raster mehrerer Bilder. */
export default function GalleryBlockView({ images }: GalleryBlock) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {images.map((entry, index) => {
        const ref = payloadMediaRef(entry.image, { alt: entry.caption ?? undefined });
        if (!ref) return null;
        return (
          <figure key={entry.id ?? index}>
            <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 5" }}>
              <Media
                {...ref}
                className="absolute inset-0 w-full h-full"
                imageClassName="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {entry.caption && (
              <figcaption className="type-label-caps text-on-surface-variant mt-3">{entry.caption}</figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

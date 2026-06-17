import Media from "@/components/Media";
import { payloadMediaRef } from "@/lib/media";
import type { VideoBlock } from "@/payload-types";

/**
 * Video-Block — definierter Slot für die echte HLS-Wiedergabe (Sprint 8).
 * Bis dahin nur Standbild (`data-video-slot` markiert die spätere
 * Austauschstelle, analog zur Hero-Section).
 */
export default function VideoBlockView({ poster, caption }: VideoBlock) {
  const ref = payloadMediaRef(poster, { alt: caption ?? undefined });
  if (!ref) return null;

  return (
    <figure data-video-slot="journal">
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 9" }}>
        <Media {...ref} className="absolute inset-0 w-full h-full" imageClassName="object-cover w-full h-full" sizes="100vw" />
      </div>
      {caption && <figcaption className="type-label-caps text-on-surface-variant mt-3">{caption}</figcaption>}
    </figure>
  );
}

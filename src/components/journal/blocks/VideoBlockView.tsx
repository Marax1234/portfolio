/**
 * VideoBlockView — Journal-Video-Block (Sprint 8)
 *
 * Spielt ein HLS-Video (VideoLoop) ab, wenn ein `video`-Feld gesetzt und
 * status=ready ist. Fällt sonst auf das `poster`-Standbild zurück
 * (Verhalten aus Sprint 6).
 *
 * Kein Hardcode (§0.2).
 */

import Media from "@/components/Media";
import VideoLoop from "@/components/VideoLoop";
import { payloadMediaRef, payloadVideoRef } from "@/lib/media";
import type { VideoBlock } from "@/payload-types";

export default function VideoBlockView({ video, poster, caption }: VideoBlock) {
  const resolvedVideo = payloadVideoRef(video ?? null);
  const posterRef = payloadMediaRef(poster ?? null, { alt: caption ?? undefined });

  if (!resolvedVideo && !posterRef) return null;

  return (
    <figure data-video-slot="journal">
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 9" }}>
        {resolvedVideo ? (
          <VideoLoop
            video={resolvedVideo}
            posterSrc={resolvedVideo.posterUrl}
            posterAlt={resolvedVideo.alt}
            variant="block"
            className="absolute inset-0 w-full h-full"
          />
        ) : posterRef ? (
          <Media
            {...posterRef}
            className="absolute inset-0 w-full h-full"
            imageClassName="object-cover w-full h-full"
            sizes="100vw"
          />
        ) : null}
      </div>
      {caption && (
        <figcaption className="type-label-caps text-on-surface-variant mt-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

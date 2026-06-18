"use client";

/**
 * VideoLoop — HLS-Player-Komponente (Sprint 8)
 *
 * Rendert einen stummen, autoplayenden Video-Loop mit Poster-Fallback und
 * Mist-Blue-Tint (design.md §Video-Loop Components).
 *
 * - `variant="hero"`: edge-to-edge, kein Radius, kein Controls-Hover.
 * - `variant="block"`: rounded-xl, Controls bei Hover einblenden.
 *
 * hls.js lädt erst, wenn der Wrapper in den Viewport eintritt
 * (IntersectionObserver). Das Poster bleibt sichtbar, bis `canplay` feuert.
 *
 * Safari mit ManagedMediaSource: native HLS via video.src (kein hls.js nötig).
 * Andere Browser: hls.js über MSE.
 *
 * Kein Hardcode (§0.2) — nur Tailwind-Utilities/Tokens.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ResolvedVideo } from "@/lib/media";

// Dynamischer Import von hls.js — nur Client-seitig
type HlsConstructor = typeof import("hls.js").default;

interface VideoLoopProps {
  video: ResolvedVideo;
  /** Poster-AnyMediaRef — dargestellt via next/image als Fallback-Layer. */
  posterSrc?: string;
  /** Wird nur für das alt-Attribut des Poster-Bilds genutzt. */
  posterAlt?: string;
  variant?: "hero" | "block";
  className?: string;
}

export default function VideoLoop({
  video,
  posterSrc,
  posterAlt,
  variant = "block",
  className,
}: VideoLoopProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<InstanceType<HlsConstructor> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const videoEl = videoRef.current;
    if (!wrapper || !videoEl) return;

    let hlsInstance: InstanceType<HlsConstructor> | null = null;
    let observer: IntersectionObserver | null = null;

    async function initPlayer() {
      if (!videoEl) return;

      const src = video.hlsUrl;

      // Safari mit ManagedMediaSource: native HLS
      if (
        videoEl.canPlayType("application/vnd.apple.mpegurl") &&
        typeof window !== "undefined" &&
        "ManagedMediaSource" in window
      ) {
        videoEl.src = src;
        videoEl.play().catch(() => undefined);
        return;
      }

      // Alle anderen Browser: hls.js
      const { default: Hls } = await import("hls.js");
      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          capLevelToPlayerSize: true,
          startLevel: -1, // Auto-ABR
        });
        hlsRef.current = hlsInstance;
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(videoEl);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          videoEl.play().catch(() => undefined);
        });
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        // Fallback: native ohne ManagedMediaSource (älteres Safari)
        videoEl.src = src;
        videoEl.play().catch(() => undefined);
      }
    }

    // Lazy-load: Player erst starten, wenn sichtbar
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          initPlayer().catch(console.error);
          observer?.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(wrapper);

    return () => {
      observer?.disconnect();
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsRef.current = null;
      }
    };
  }, [video.hlsUrl]);

  const isHero = variant === "hero";
  const aspectStyle = isHero ? undefined : { aspectRatio: `${video.width} / ${video.height}` };

  return (
    <div
      ref={wrapperRef}
      className={[
        "relative overflow-hidden",
        isHero ? "absolute inset-0 w-full h-full" : `w-full ${!isHero ? "rounded-xl" : ""}`,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={aspectStyle}
      onMouseEnter={() => !isHero && setShowControls(true)}
      onMouseLeave={() => !isHero && setShowControls(false)}
    >
      {/* Poster-Layer — bleibt sichtbar, bis das Video spielt */}
      {posterSrc && !playing && (
        <Image
          src={posterSrc}
          alt={posterAlt ?? video.alt}
          fill
          className="object-cover"
          sizes={isHero ? "100vw" : "(max-width:768px) 100vw, 80vw"}
          priority={isHero}
        />
      )}

      {/* Video-Element */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        width={video.width}
        height={video.height}
        className={[
          "w-full h-full object-cover",
          isHero ? "" : "rounded-xl",
        ]
          .filter(Boolean)
          .join(" ")}
        onCanPlay={() => setPlaying(true)}
        aria-label={video.alt}
        controls={!isHero && showControls}
      />

      {/* Mist-Blue-Tint — design.md §Video-Loop Components (10–15 %) */}
      <div className="absolute inset-0 bg-mist-blue/15 pointer-events-none" />
    </div>
  );
}

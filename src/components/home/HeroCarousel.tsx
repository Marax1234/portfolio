"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { AnyMediaRef } from "@/lib/media";

interface HeroCarouselProps {
  posters: AnyMediaRef[];
  intervalMs?: number;
}

interface ResolvedPoster {
  src: string;
  width: number;
  height: number;
  alt: string;
}

function resolveRef(ref: AnyMediaRef): ResolvedPoster | null {
  if ("payload" in ref) {
    return {
      src: ref.payload.url,
      width: ref.payload.width,
      height: ref.payload.height,
      alt: ref.payload.alt ?? "",
    };
  }
  return null;
}

export default function HeroCarousel({ posters, intervalMs = 5000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const count = posters.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {posters.map((ref, i) => {
        const resolved = resolveRef(ref);
        if (!resolved) return null;
        return (
          <div
            key={i}
            className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={resolved.src}
              width={resolved.width}
              height={resolved.height}
              alt={resolved.alt}
              priority={i === 0}
              sizes="100vw"
              className="object-cover w-full h-full"
            />
          </div>
        );
      })}

      <button
        onClick={prev}
        aria-label="Vorheriges Bild"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-inverse-surface/30 text-inverse-on-surface backdrop-blur-sm transition-colors hover:bg-inverse-surface/50"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={next}
        aria-label="Nächstes Bild"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-inverse-surface/30 text-inverse-on-surface backdrop-blur-sm transition-colors hover:bg-inverse-surface/50"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

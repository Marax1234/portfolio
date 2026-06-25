"use client";

import { useState, useEffect } from "react";
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

  const next = () => setCurrent((p) => (p + 1) % count);
  const prev = () => setCurrent((p) => (p - 1 + count) % count);

  // Timer auf `current` hören lassen: jeder Wechsel (auto wie manuell) setzt
  // ihn zurück, damit der Fortschritts-Strich synchron zum Auto-Wechsel läuft.
  useEffect(() => {
    if (count <= 1) return;
    const timer = setTimeout(() => {
      setCurrent((p) => (p + 1) % count);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [current, count, intervalMs]);

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
        className="absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center p-2 text-inverse-on-surface/80 drop-shadow-md transition-opacity hover:text-inverse-on-surface"
      >
        <svg width="30" height="30" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={next}
        aria-label="Nächstes Bild"
        className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center p-2 text-inverse-on-surface/80 drop-shadow-md transition-opacity hover:text-inverse-on-surface"
      >
        <svg width="30" height="30" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Segmentierte Fortschrittsanzeige unten links: ein Strich pro Bild,
          der aktive füllt sich im Takt des Auto-Wechsels. Bereits gezeigte
          Striche sind voll, kommende leer. Klick springt direkt zum Bild. */}
      <div className="absolute bottom-6 inset-x-0 z-20 container-page pointer-events-none">
        <div className="flex w-fit items-center gap-2 pointer-events-auto">
          {posters.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Bild ${i + 1} von ${count}`}
              aria-current={i === current ? "true" : undefined}
              className="group py-2"
            >
              <span className="block h-0.5 w-8 overflow-hidden bg-inverse-on-surface/30 transition-colors group-hover:bg-inverse-on-surface/50">
                <span
                  className="block h-full w-full origin-left bg-inverse-on-surface"
                  style={
                    i < current
                      ? { transform: "scaleX(1)" }
                      : i === current
                        ? { animation: `hero-progress ${intervalMs}ms linear both` }
                        : { transform: "scaleX(0)" }
                  }
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

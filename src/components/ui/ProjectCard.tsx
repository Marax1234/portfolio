/**
 * ProjectCard — geteiltes Bauteil für „Arbeiten" und „Journal" (Sprint 2)
 *
 * Konzept §5: „Story-/Projekt-Karte — Cover + Titel + Mini-Info.
 * Gleiches Bauteil für Journal und Arbeiten."
 *
 * Props:
 *   id|payload — AnyMediaRef für <Media> (Manifest-Slot oder
 *                Payload-Upload-Dokument, Sprint 5; Sprint 7: Object Storage)
 *   title      — Projekttitel
 *   meta       — kurze Info (Kategorie, Datum, Ort …)
 *   href       — Zielseite (Detailseite oder /journal/[slug])
 *
 * Hover: dezente Skalierung des Cover-Bilds (reduced-motion-safe).
 * Gesamte Karte ist next/link (kein Wrapper-Link-Muster).
 *
 * Kein Hardcode (§0.2).
 */

import Link from "next/link";
import Media from "@/components/Media";
import type { AnyMediaRef } from "@/lib/media";

type ProjectCardProps = AnyMediaRef & {
  title: string;
  meta?: string;
  href: string;
  /** Optionale alt-Text-Überschreibung (Standard: Titel) */
  alt?: string;
  sizes?: string;
};

export default function ProjectCard({
  title,
  meta,
  href,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  ...ref
}: ProjectCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest hover:border-outline transition-colors"
      style={{ boxShadow: "var(--shadow-ambient)" }}
    >
      {/* Cover-Bild — 4:3 Seitenverhältnis */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <Media
          {...ref}
          alt={alt ?? title}
          className="absolute inset-0 w-full h-full"
          imageClassName="object-cover w-full h-full transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
          sizes={sizes}
        />
      </div>

      {/* Text-Bereich */}
      <div className="p-5">
        {meta && (
          <p className="type-label-caps text-on-surface-variant mb-2">{meta}</p>
        )}
        <h3 className="type-body-lg text-on-surface group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </Link>
  );
}

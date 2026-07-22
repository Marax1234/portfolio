/**
 * JournalTeaserSection — „Aus dem Journal" (Sprint 3)
 *
 * Konzept §4.1: „Journal-Teaser ist das Lebendige. Es zeigt: hier ist ein
 * Mensch mit laufendem Output, kein totes Schaufenster." Nutzt die
 * geteilte ProjectCard (Sprint 2).
 *
 * Sprint 5: Einträge + Überschrift kommen aus `JournalPosts`/
 * `SiteConfig.journalTeaser` (Payload). Ohne Einträge greifen die
 * Sprint-3-Platzhalter als Fallback.
 *
 * Kein Hardcode (§0.2).
 */

import ProjectCard from "@/components/ui/ProjectCard";
import type { AnyMediaRef } from "@/lib/media";

interface JournalEntry {
  key: string;
  ref: AnyMediaRef;
  title: string;
  meta: string;
  href: string;
}

const FALLBACK_ENTRIES: JournalEntry[] = [
  {
    key: "journal-1",
    ref: { id: "journal-1" },
    title: "Durch Marokko — 14 Tage, 2.400 km",
    meta: "Reise · März 2024",
    href: "/journal/marokko-2024",
  },
  {
    key: "journal-2",
    ref: { id: "journal-2" },
    title: "Mitteldistanz #3 — was beim dritten Mal anders war",
    meta: "Sport · Mai 2024",
    href: "/journal/mitteldistanz-3",
  },
  {
    key: "journal-3",
    ref: { id: "journal-3" },
    title: "Hinter der Kamera bei Lisa & Max",
    meta: "Behind-the-Scenes · Juni 2024",
    href: "/journal/bts-lisa-max",
  },
];

interface JournalTeaserSectionProps {
  eyebrow?: string;
  headline?: string;
  entries?: JournalEntry[];
  className?: string;
}

export default function JournalTeaserSection({
  eyebrow = "Aus dem Journal",
  headline = "Laufende Geschichten.",
  entries = FALLBACK_ENTRIES,
  className = "",
}: JournalTeaserSectionProps) {
  return (
    <section className={className}>
      <p className="type-label-caps text-primary mb-3">{eyebrow}</p>
      <h2 className="type-headline-md text-on-surface mb-8">{headline}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(({ key, ref, title, meta, href }) => (
          <ProjectCard key={key} {...ref} title={title} meta={meta} href={href} />
        ))}
      </div>
    </section>
  );
}

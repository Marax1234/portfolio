/**
 * Reine Formatierungs-Helfer ohne Payload-Zugriff (aus lib/payload.ts, B25 S-07: testbar
 * ohne DB und Payload-Boot). `@/lib/payload` exportiert sie weiter.
 */
import type { Journal, Project } from "@/payload-types";

const PROJECT_CATEGORY_LABELS: Record<Project["category"], string> = {
  hochzeiten: "Hochzeiten",
  menschen: "Menschen",
  reisen: "Reisen",
  sport: "Sport",
  commercial: "Commercial",
};

const JOURNAL_CATEGORY_LABELS: Record<Journal["category"], string> = {
  reise: "Reise",
  sport: "Sport",
  "behind-the-scenes": "Behind-the-Scenes",
  sonstiges: "Sonstiges",
};

/** "Reise · März 2024" — für ProjectCard-`meta` (Journal-Teaser, Journal-Übersicht). */
export function formatMeta(
  category: Journal["category"] | Project["category"],
  publishedAt?: string | null,
): string {
  const label =
    JOURNAL_CATEGORY_LABELS[category as Journal["category"]] ??
    PROJECT_CATEGORY_LABELS[category as Project["category"]] ??
    category;
  if (!publishedAt) return label;
  const formatted = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(
    new Date(publishedAt),
  );
  return `${label} · ${formatted}`;
}

export const PROJECT_CATEGORIES: { value: Project["category"]; label: string }[] = (
  Object.entries(PROJECT_CATEGORY_LABELS) as [Project["category"], string][]
).map(([value, label]) => ({ value, label }));

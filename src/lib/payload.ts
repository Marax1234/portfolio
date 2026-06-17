/**
 * Daten-Zugriffsschicht (Sprint 5) — einziger Ort, an dem Frontend-Seiten
 * die Payload Local API aufrufen. Jeder Fetcher ist mit `unstable_cache`
 * getaggt; `src/hooks/revalidate.ts` invalidiert exakt diese Tags, wenn
 * der zugehörige Inhalt im Admin geändert wird (§0.6 ISR-Akzeptanz).
 *
 * `getPayload({ config })` läuft im selben Next.js-Prozess (kein REST-Hop,
 * kein Access-Control-Gate — siehe Sprint-4-Übergabe §3 "Local API").
 */
import { unstable_cache } from "next/cache";
import config from "@payload-config";
import { getPayload } from "payload";
import type { AboutPage, Journal, Project, SiteConfig } from "@/payload-types";

async function payload() {
  return getPayload({ config });
}

export const getSiteConfig = unstable_cache(
  async (): Promise<SiteConfig> => {
    const p = await payload();
    return p.findGlobal({ slug: "site-config", depth: 1 });
  },
  ["site-config"],
  { tags: ["site-config"] },
);

export const getAboutPage = unstable_cache(
  async (): Promise<AboutPage> => {
    const p = await payload();
    return p.findGlobal({ slug: "about-page", depth: 1 });
  },
  ["about-page"],
  { tags: ["about-page"] },
);

export const getFeaturedProject = unstable_cache(
  async (): Promise<Project | null> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "projects",
      where: { featured: { equals: true } },
      sort: "order",
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  ["projects", "featured"],
  { tags: ["projects"] },
);

export const getProjects = unstable_cache(
  async (category?: Project["category"]): Promise<Project[]> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "projects",
      where: category ? { category: { equals: category } } : undefined,
      sort: "order",
      limit: 200,
      depth: 1,
    });
    return docs;
  },
  ["projects", "list"],
  { tags: ["projects"] },
);

export const getAllProjectSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "projects",
      limit: 200,
      depth: 0,
    });
    return docs.map((doc) => doc.slug);
  },
  ["projects", "slugs"],
  { tags: ["projects"] },
);

export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<Project | null> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "projects",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  ["projects", "by-slug"],
  { tags: ["projects"] },
);

/**
 * Prev/Next für die Detailseite (Konzept §4.2: „keine Sackgasse").
 * Reihung folgt `order` (wie das Arbeiten-Grid); bei Gleichstand zusätzlich
 * `id`, damit die Reihenfolge stabil ist.
 */
export const getProjectNeighbors = unstable_cache(
  async (slug: string): Promise<{ prev: Project | null; next: Project | null }> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "projects",
      sort: "order",
      limit: 200,
      depth: 0,
    });
    const index = docs.findIndex((doc) => doc.slug === slug);
    if (index === -1) return { prev: null, next: null };

    const prevDoc = docs[(index - 1 + docs.length) % docs.length];
    const nextDoc = docs[(index + 1) % docs.length];

    const p2 = await payload();
    const [prev, next] = await Promise.all([
      prevDoc.slug === slug ? null : p2.findByID({ collection: "projects", id: prevDoc.id, depth: 1 }),
      nextDoc.slug === slug ? null : p2.findByID({ collection: "projects", id: nextDoc.id, depth: 1 }),
    ]);

    return { prev, next };
  },
  ["projects", "neighbors"],
  { tags: ["projects"] },
);

export const getJournalTeasers = unstable_cache(
  async (limit = 3): Promise<Journal[]> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "journal",
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    return docs;
  },
  ["journal", "teasers"],
  { tags: ["journal"] },
);

export const getJournalBySlug = unstable_cache(
  async (slug: string): Promise<Journal | null> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "journal",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  ["journal", "by-slug"],
  { tags: ["journal"] },
);

/** Übersichts-Feed (`/journal`, Konzept §4.4) — neueste zuerst. */
export const getJournalPosts = unstable_cache(
  async (): Promise<Journal[]> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "journal",
      sort: "-publishedAt",
      limit: 200,
      depth: 1,
    });
    return docs;
  },
  ["journal", "list"],
  { tags: ["journal"] },
);

/** Für `generateStaticParams` auf `/journal/[slug]`. */
export const getAllJournalSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "journal",
      limit: 200,
      depth: 0,
    });
    return docs.map((doc) => doc.slug);
  },
  ["journal", "slugs"],
  { tags: ["journal"] },
);

/**
 * Prev/Next für die Detailseite (Konzept §4.4: „keine Sackgasse", analog
 * `getProjectNeighbors`). Reihung folgt `publishedAt` (neueste zuerst, wie
 * der Feed).
 */
export const getJournalNeighbors = unstable_cache(
  async (slug: string): Promise<{ prev: Journal | null; next: Journal | null }> => {
    const p = await payload();
    const { docs } = await p.find({
      collection: "journal",
      sort: "-publishedAt",
      limit: 200,
      depth: 0,
    });
    const index = docs.findIndex((doc) => doc.slug === slug);
    if (index === -1) return { prev: null, next: null };

    const prevDoc = docs[(index - 1 + docs.length) % docs.length];
    const nextDoc = docs[(index + 1) % docs.length];

    const p2 = await payload();
    const [prev, next] = await Promise.all([
      prevDoc.slug === slug ? null : p2.findByID({ collection: "journal", id: prevDoc.id, depth: 1 }),
      nextDoc.slug === slug ? null : p2.findByID({ collection: "journal", id: nextDoc.id, depth: 1 }),
    ]);

    return { prev, next };
  },
  ["journal", "neighbors"],
  { tags: ["journal"] },
);

/** „Verwandte Beiträge" (Konzept §4.4) — bevorzugt gleiche Kategorie, sonst die nächstälteren. */
export const getRelatedJournal = unstable_cache(
  async (slug: string, limit = 3): Promise<Journal[]> => {
    const p = await payload();
    const current = await p.find({
      collection: "journal",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const currentDoc = current.docs[0];
    if (!currentDoc) return [];

    const { docs: sameCategory } = await p.find({
      collection: "journal",
      where: { category: { equals: currentDoc.category }, slug: { not_equals: slug } },
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    if (sameCategory.length >= limit) return sameCategory;

    const { docs: rest } = await p.find({
      collection: "journal",
      where: { slug: { not_equals: slug } },
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    const seen = new Set(sameCategory.map((doc) => doc.id));
    return [...sameCategory, ...rest.filter((doc) => !seen.has(doc.id))].slice(0, limit);
  },
  ["journal", "related"],
  { tags: ["journal"] },
);

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

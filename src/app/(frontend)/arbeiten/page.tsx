/**
 * /arbeiten — Übersicht (Sprint 5, Konzept §4.2 · Redesign-Sprint)
 *
 * Masonry-Galerie mit Filter-Tabs (Alle/Hochzeiten/Menschen/Reisen/Sport/
 * Commercial). Pro Projekt erscheint nicht nur das Cover, sondern jedes
 * zugeordnete Bild (Cover + `gallery[]`) als eigene Kachel — alle verlinken
 * auf dieselbe Detailseite (`/arbeiten/[slug]`). Beschriftung erst beim
 * Hovern — getragen von `WorksGrid` + `GalleryCard`. Max. eine Klicktiefe
 * zur Detailseite.
 *
 * Jedes Bild wird hier server-seitig als <Media>-Node gerendert und an die
 * Client-Galerie übergeben (RSC-Grenze, §0.5). Bilder ausschließlich über
 * <Media> (§0.5). Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import Media from "@/components/Media";
import WorksGrid, { type WorksGridItem } from "@/components/arbeiten/WorksGrid";
import { payloadMediaRef } from "@/lib/media";
import { formatMeta, getProjects, PROJECT_CATEGORIES } from "@/lib/payload";

// B25 D-02: Der Build läuft ohne DB, daher wird diese Seite pro Request gerendert. Die
// Payload-Daten bleiben per `unstable_cache` (Tags, src/lib/payload.ts) gecacht.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arbeiten — Kilian Siebert",
  description: "Hochzeiten, Reisen, Sport, Commercial — eine Auswahl.",
};

/**
 * Kuratierter Seitenverhältnis-Rhythmus für die Masonry-Wand. Wechselt bewusst
 * zwischen kurz/breit (3:2) und hoch (bis 5:7), damit die Kacheln sichtbar
 * unterschiedlich lang werden — auch wenn die Quell-Cover alle 4:3 sind
 * (`object-cover` mittig schneidet entsprechend zu). Pro Projekt-Index stabil
 * zugewiesen, also unabhängig von Filter/Reihenfolge.
 *
 * Reine Layout-Werte (keine Design-Tokens), in der Skala absichtlich moderat
 * gehalten, damit zentrale Motive erkennbar bleiben.
 */
const COVER_RATIOS = ["3 / 2", "4 / 5", "4 / 3", "5 / 7", "1 / 1"];

export default async function ArbeitenPage() {
  const projects = await getProjects();

  /**
   * Jedes Projekt liefert nicht nur sein Cover, sondern alle zugeordneten
   * Bilder (Cover + `gallery[]`) als eigene Kachel — alle mit gleichem
   * Titel/Kategorie und Link auf dieselbe Detailseite (`/arbeiten/[slug]`).
   * Bild-Strecke bleibt so auf der Übersicht sichtbar statt erst im Detail.
   */
  const items: WorksGridItem[] = [];
  let tileIndex = 0;

  for (const project of projects) {
    const meta = formatMeta(project.category, project.publishedAt);
    const href = `/arbeiten/${project.slug}`;

    const coverRef = payloadMediaRef(project.cover, { alt: project.title }) ?? { id: "placeholder" };
    items.push({
      id: `${project.id}-cover`,
      category: project.category,
      title: project.title,
      meta,
      href,
      aspectRatio: COVER_RATIOS[tileIndex++ % COVER_RATIOS.length],
      media: (
        <Media
          {...coverRef}
          alt={project.title}
          className="absolute inset-0 h-full w-full"
          imageClassName="object-cover h-full w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ),
    });

    for (const [galleryIndex, entry] of (project.gallery ?? []).entries()) {
      const ref = payloadMediaRef(entry.image, { alt: entry.caption ?? project.title });
      if (!ref) continue;
      items.push({
        id: `${project.id}-${galleryIndex}`,
        category: project.category,
        title: project.title,
        meta,
        href,
        aspectRatio: COVER_RATIOS[tileIndex++ % COVER_RATIOS.length],
        media: (
          <Media
            {...ref}
            alt={entry.caption ?? project.title}
            className="absolute inset-0 h-full w-full"
            imageClassName="object-cover h-full w-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ),
      });
    }
  }

  return (
    <div className="container-page section-gap-y">
      <p className="type-label-caps text-primary mb-3">Arbeiten</p>
      <h1 className="type-display-lg text-on-surface mb-10">
        Hochzeiten, Reisen, Sport, Commercial.
      </h1>

      <WorksGrid items={items} categories={PROJECT_CATEGORIES} />
    </div>
  );
}

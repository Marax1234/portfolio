/**
 * /arbeiten — Übersicht (Sprint 5, Konzept §4.2)
 *
 * Grid mit Filter-Tabs (Alle/Hochzeiten/Menschen/Reisen/Sport/Commercial),
 * Cover pro Projekt, Hover-Info über die geteilte `ProjectCard`. Max. eine
 * Klicktiefe zur Detailseite (`ProjectCard` verlinkt direkt auf
 * `/arbeiten/[slug]`).
 *
 * Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import ProjectCard from "@/components/ui/ProjectCard";
import WorksGrid, { type WorksGridItem } from "@/components/arbeiten/WorksGrid";
import { payloadMediaRef } from "@/lib/media";
import { formatMeta, getProjects, PROJECT_CATEGORIES } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Arbeiten — Kilian Siebert",
  description: "Hochzeiten, Reisen, Sport, Commercial — eine Auswahl.",
};

export default async function ArbeitenPage() {
  const projects = await getProjects();

  const items: WorksGridItem[] = projects.map((project) => ({
    id: String(project.id),
    category: project.category,
    node: (
      <ProjectCard
        {...(payloadMediaRef(project.cover, { alt: project.title }) ?? { id: "placeholder" })}
        title={project.title}
        meta={formatMeta(project.category, project.publishedAt)}
        href={`/arbeiten/${project.slug}`}
      />
    ),
  }));

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

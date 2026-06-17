/**
 * /arbeiten/[slug] — Projekt-Detailseite (Sprint 5, Konzept §4.2)
 *
 * Aufbau: Hero → knapper Kontext (Titel/Ort/für wen/2–3 Sätze) →
 * Bild-/Video-Strecke (Platzhalter-Medien, Video-Slots folgen Sprint 8) →
 * Prev/Next („keine Sackgasse"). `generateStaticParams` + ISR-Hook
 * (`revalidateProjects`) statisch schnell + automatisch aktuell.
 *
 * Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Media from "@/components/Media";
import RichText from "@/components/RichText";
import { payloadMediaRef } from "@/lib/media";
import { formatMeta, getAllProjectSlugs, getProjectBySlug, getProjectNeighbors } from "@/lib/payload";

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Kilian Siebert`,
    description: project.excerpt ?? undefined,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { prev, next } = await getProjectNeighbors(slug);
  const coverRef = payloadMediaRef(project.cover, { alt: project.title }) ?? { id: "placeholder" as const };

  return (
    <article>
      {/* Hero — Full-Bleed */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
        <Media
          {...coverRef}
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full"
          imageClassName="object-cover w-full h-full"
        />
      </div>

      <div className="container-page section-gap-y">
        {/* Kontextblock — knapp, kein Roman (Konzept §4.2) */}
        <p className="type-label-caps text-primary mb-3">{formatMeta(project.category, project.publishedAt)}</p>
        <h1 className="type-display-lg text-on-surface mb-4">{project.title}</h1>
        {(project.location || project.client) && (
          <p className="type-body-md text-on-surface-variant mb-6">
            {[project.location, project.client].filter(Boolean).join(" · ")}
          </p>
        )}
        {project.body ? (
          <RichText data={project.body} className="type-body-lg text-on-surface max-w-prose" />
        ) : (
          project.excerpt && <p className="type-body-lg text-on-surface max-w-prose">{project.excerpt}</p>
        )}

        {/* Bild-/Video-Strecke — Bild ist Hauptsache, Text ist Beilage */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="section-gap flex flex-col gap-12">
            {project.gallery.map((entry, index) => {
              const imageRef = payloadMediaRef(entry.image, { alt: entry.caption ?? project.title });
              if (!imageRef) return null;
              return (
                <figure key={entry.id ?? index}>
                  <div
                    className="relative w-full overflow-hidden rounded-xl"
                    style={{ aspectRatio: index % 2 === 0 ? "16 / 10" : "4 / 5" }}
                  >
                    <Media
                      {...imageRef}
                      className="absolute inset-0 w-full h-full"
                      imageClassName="object-cover w-full h-full"
                      sizes="100vw"
                    />
                  </div>
                  {entry.caption && (
                    <figcaption className="type-label-caps text-on-surface-variant mt-3">
                      {entry.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        )}

        {/* Prev/Next — keine Sackgasse */}
        <nav className="section-gap flex items-center justify-between border-t border-outline-variant pt-8">
          {prev ? (
            <Link href={`/arbeiten/${prev.slug}`} className="type-label-caps text-on-surface hover:text-primary transition-colors">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/arbeiten/${next.slug}`} className="type-label-caps text-on-surface hover:text-primary transition-colors text-right">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  );
}

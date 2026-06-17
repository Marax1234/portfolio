/**
 * /journal/[slug] — Beitrags-Detailseite (Sprint 6, Konzept §4.4)
 *
 * Aufbau: Cover-Hero → Kontextblock (Kategorie/Datum + Titel) → frei
 * komponiertes Block-Layout (Text = schmale Lesespalte, Bild/Galerie/Video
 * = volle Breite) → verwandte Beiträge + dezenter Social-Hinweis →
 * Prev/Next („keine Sackgasse"). Live Preview via `RefreshRouteOnSave`
 * (save-triggered, §0.6 RSC-Standard). `generateStaticParams` + ISR-Hook
 * (`revalidateJournal`) statisch schnell + automatisch aktuell.
 *
 * Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/journal/BlockRenderer";
import Media from "@/components/Media";
import RefreshRouteOnSave from "@/components/RefreshRouteOnSave";
import ProjectCard from "@/components/ui/ProjectCard";
import { payloadMediaRef } from "@/lib/media";
import {
  formatMeta,
  getAllJournalSlugs,
  getJournalBySlug,
  getJournalNeighbors,
  getRelatedJournal,
} from "@/lib/payload";
import { SOCIAL_LINKS } from "@/lib/navigation";

export async function generateStaticParams() {
  const slugs = await getAllJournalSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface JournalPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JournalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Kilian Siebert`,
    description: post.excerpt ?? undefined,
  };
}

export default async function JournalDetailPage({ params }: JournalPageProps) {
  const { slug } = await params;
  const post = await getJournalBySlug(slug);
  if (!post) notFound();

  const { prev, next } = await getJournalNeighbors(slug);
  const related = await getRelatedJournal(slug);
  const coverRef = payloadMediaRef(post.cover, { alt: post.title }) ?? { id: "placeholder" as const };

  return (
    <article>
      <RefreshRouteOnSave />

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
        {/* Kontextblock */}
        <p className="type-label-caps text-primary mb-3">{formatMeta(post.category, post.publishedAt)}</p>
        <h1 className="type-display-lg text-on-surface mb-10">{post.title}</h1>

        {/* Frei komponiertes Block-Layout */}
        <BlockRenderer blocks={post.layout} />

        {/* Verwandte Beiträge + dezenter Social-Hinweis */}
        {related.length > 0 && (
          <div className="section-gap">
            <p className="type-label-caps text-on-surface-variant mb-6">Verwandte Beiträge</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((entry) => (
                <ProjectCard
                  key={entry.id}
                  {...(payloadMediaRef(entry.cover, { alt: entry.title }) ?? { id: "placeholder" })}
                  title={entry.title}
                  meta={formatMeta(entry.category, entry.publishedAt)}
                  href={`/journal/${entry.slug}`}
                />
              ))}
            </div>
          </div>
        )}

        <p className="section-gap type-label-caps text-on-surface-variant">
          Mehr davon auf{" "}
          {SOCIAL_LINKS.map((social, index) => (
            <span key={social.platform}>
              <a href={social.href} className="text-primary hover:underline">
                {social.label}
              </a>
              {index < SOCIAL_LINKS.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>

        {/* Prev/Next — keine Sackgasse */}
        <nav className="section-gap flex items-center justify-between border-t border-outline-variant pt-8">
          {prev ? (
            <Link href={`/journal/${prev.slug}`} className="type-label-caps text-on-surface hover:text-primary transition-colors">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/journal/${next.slug}`} className="type-label-caps text-on-surface hover:text-primary transition-colors text-right">
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

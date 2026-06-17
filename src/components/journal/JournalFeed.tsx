import Link from "next/link";
import Media from "@/components/Media";
import { payloadMediaRef } from "@/lib/media";
import { formatMeta } from "@/lib/payload";
import type { Journal } from "@/payload-types";

/**
 * <JournalFeed> — Übersichts-Feed (Konzept §4.4): großes Cover, Titel,
 * Datum/Kategorie, 2-Zeilen-Teaser. Mobile-first eine Spalte.
 */
export default function JournalFeed({ posts }: { posts: Journal[] }) {
  if (posts.length === 0) {
    return <p className="type-body-md text-on-surface-variant">Noch keine Beiträge.</p>;
  }

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {posts.map((post) => {
        const ref = payloadMediaRef(post.cover, { alt: post.title }) ?? { id: "placeholder" as const };
        return (
          <Link key={post.id} href={`/journal/${post.slug}`} className="group grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 sm:items-center">
            <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 3" }}>
              <Media
                {...ref}
                className="absolute inset-0 w-full h-full"
                imageClassName="object-cover w-full h-full transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 40vw"
              />
            </div>
            <div>
              <p className="type-label-caps text-primary mb-2">{formatMeta(post.category, post.publishedAt)}</p>
              <h2 className="type-headline-md text-on-surface group-hover:text-primary transition-colors mb-3">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="type-body-md text-on-surface-variant line-clamp-2">{post.excerpt}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

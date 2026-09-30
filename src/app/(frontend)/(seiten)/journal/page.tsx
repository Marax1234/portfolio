/**
 * /journal — Übersicht (Sprint 6, Konzept §4.4)
 *
 * Feed mit großem Cover, Titel, Datum/Kategorie, 2-Zeilen-Teaser — bewusst
 * kein Grid mit Filter-Tabs wie /arbeiten, sondern der chronologische
 * „laufende Output"-Feed aus dem Konzept.
 *
 * Kein Hardcode (§0.2).
 */
import type { Metadata } from "next";
import JournalFeed from "@/components/journal/JournalFeed";
import { getJournalPosts } from "@/lib/payload";

// B25 D-02: Der Build läuft ohne DB, daher wird diese Seite pro Request gerendert. Die
// Payload-Daten bleiben per `unstable_cache` (Tags, src/lib/payload.ts) gecacht.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal — Kilian Siebert",
  description: "Reiseberichte, Wettkämpfe, Behind-the-Scenes — laufender Output.",
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="container-page section-gap-y">
      <p className="type-label-caps text-primary mb-3">Journal</p>
      <h1 className="type-display-lg text-on-surface mb-10">Reisen, Wettkämpfe, Behind-the-Scenes.</h1>

      <JournalFeed posts={posts} />
    </div>
  );
}

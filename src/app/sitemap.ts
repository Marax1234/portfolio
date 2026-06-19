/**
 * sitemap.ts — XML-Sitemap für /sitemap.xml (Sprint 10, SEO-Härtung)
 *
 * Generiert beim Build: statische Routen + dynamische Slugs aus Payload
 * (Projekte und Journal-Beiträge via vorhandene getCached-Helfer).
 *
 * Basis-URL: NEXT_PUBLIC_SERVER_URL (aus .env, muss im Deployment gesetzt sein).
 * Änderungsfrequenz und Priorität orientieren sich am Konzept §3 (flache
 * Seitenstruktur: Startseite = höchste Prio, Detailseiten = medium).
 */

import type { MetadataRoute } from "next";
import { getAllJournalSlugs, getAllProjectSlugs } from "@/lib/payload";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/arbeiten`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/ueber`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/journal`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${base}/kontakt`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/kooperationen`, priority: 0.7, changeFrequency: "monthly" },
  ];

  // Dynamische Slug-Listen aus gecachten Payload-Helpern (src/lib/payload.ts)
  let projectSlugs: string[] = [];
  let journalSlugs: string[] = [];

  try {
    [projectSlugs, journalSlugs] = await Promise.all([
      getAllProjectSlugs(),
      getAllJournalSlugs(),
    ]);
  } catch {
    // Datenbank nicht verfügbar beim Build (z.B. CI ohne DB) — nur statisch.
    console.warn("[sitemap] Konnte dynamische Slugs nicht laden — nur statische Routen.");
  }

  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${base}/arbeiten/${slug}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  const journalRoutes: MetadataRoute.Sitemap = journalSlugs.map((slug) => ({
    url: `${base}/journal/${slug}`,
    priority: 0.6,
    changeFrequency: "weekly" as const,
  }));

  return [...staticRoutes, ...projectRoutes, ...journalRoutes];
}

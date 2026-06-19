/**
 * robots.ts — Robots.txt für /robots.txt (Sprint 10, SEO-Härtung)
 *
 * Öffentliche Seiten: alles erlaubt.
 * Admin-Panel: gesperrt (kein Crawl des Payload-Backends).
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

/**
 * Umami-Statistik-Helfer (Sprint 10 — app-seitige Schnittstelle).
 *
 * Ruft die Umami Stats-REST-API ab, wenn UMAMI_API_URL + UMAMI_API_TOKEN +
 * UMAMI_WEBSITE_ID gesetzt sind. Sonst: leere Struktur → Deployment-Hinweis
 * im Admin-Dashboard (Akzeptanzkriterium Sprint 10).
 *
 * Server-only: Variablen ohne NEXT_PUBLIC_-Präfix — nicht im Browser verfügbar.
 * Keine Throws: Fehler werden geloggt, Fallback-Leerwerte zurückgegeben.
 *
 * API-Referenz: https://docs.umami.is/docs/api/website-stats
 * Versionsstatus: Umami 2.x (docs.umami.is, abgerufen 2026-06-19).
 */

export interface UmamiStats {
  pageviews: number;
  visitors: number;
  visits: number;
}

export interface UmamiSource {
  name: string;
  count: number;
}

export interface UmamiTopPage {
  path: string;
  views: number;
}

export interface UmamiDashboardData {
  /** true, wenn Umami-Env gesetzt und API erreichbar. */
  available: boolean;
  stats: UmamiStats;
  sources: UmamiSource[];
  topPages: UmamiTopPage[];
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const REVALIDATE_SECS = 3600; // 1 h

/**
 * Holt Statistikdaten der letzten 30 Tage aus Umami.
 * Fehler und fehlende Env-Vars → `available: false`, alle Zahlen 0.
 */
export async function getUmamiDashboardData(): Promise<UmamiDashboardData> {
  const apiUrl = process.env.UMAMI_API_URL;
  const token = process.env.UMAMI_API_TOKEN;
  const websiteId = process.env.UMAMI_WEBSITE_ID;

  const empty: UmamiDashboardData = {
    available: false,
    stats: { pageviews: 0, visitors: 0, visits: 0 },
    sources: [],
    topPages: [],
  };

  if (!apiUrl || !token || !websiteId) return empty;

  try {
    const endAt = Date.now();
    const startAt = endAt - THIRTY_DAYS_MS;
    const headers = { Authorization: `Bearer ${token}` };
    const qs = `startAt=${startAt}&endAt=${endAt}`;

    const [statsRes, sourcesRes, pagesRes] = await Promise.all([
      fetch(`${apiUrl}/api/websites/${websiteId}/stats?${qs}`, {
        headers,
        next: { revalidate: REVALIDATE_SECS },
      }),
      fetch(
        `${apiUrl}/api/websites/${websiteId}/metrics?${qs}&type=referrer&limit=5`,
        { headers, next: { revalidate: REVALIDATE_SECS } },
      ),
      fetch(
        `${apiUrl}/api/websites/${websiteId}/metrics?${qs}&type=path&limit=5`,
        { headers, next: { revalidate: REVALIDATE_SECS } },
      ),
    ]);

    if (!statsRes.ok || !sourcesRes.ok || !pagesRes.ok) {
      console.warn(
        "[umami] API-Fehler:",
        statsRes.status,
        sourcesRes.status,
        pagesRes.status,
      );
      return empty;
    }

    const [statsJson, sourcesJson, pagesJson] = (await Promise.all([
      statsRes.json(),
      sourcesRes.json(),
      pagesRes.json(),
    ])) as [
      Record<string, number>,
      Array<{ x: string; y: number }>,
      Array<{ x: string; y: number }>,
    ];

    return {
      available: true,
      stats: {
        pageviews: statsJson.pageviews ?? 0,
        visitors: statsJson.visitors ?? 0,
        visits: statsJson.visits ?? 0,
      },
      sources: sourcesJson.slice(0, 5).map((s) => ({
        name: s.x || "–",
        count: s.y ?? 0,
      })),
      topPages: pagesJson.slice(0, 5).map((p) => ({
        path: p.x || "/",
        views: p.y ?? 0,
      })),
    };
  } catch (err) {
    console.warn("[umami] Fehler beim Abrufen der Statistik:", err);
    return empty;
  }
}

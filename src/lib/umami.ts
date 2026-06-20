/**
 * Umami-Statistik-Helfer (Sprint 10 — app-seitige Schnittstelle).
 *
 * Ruft die Umami Stats-REST-API ab, wenn UMAMI_API_URL + UMAMI_ADMIN_USERNAME +
 * UMAMI_ADMIN_PASSWORD + UMAMI_WEBSITE_ID gesetzt sind. Sonst: leere Struktur →
 * Deployment-Hinweis im Admin-Dashboard (Akzeptanzkriterium Sprint 10).
 *
 * Selbst gehostetes Umami hat kein dauerhaftes "API Key" (das gibt es nur bei
 * Umami Cloud, docs.umami.is/docs/cloud/api-key) — Auth läuft per
 * Username/Passwort-Login (POST /api/auth/login → JWT). Token wird hier bei
 * Bedarf neu geholt und für REVALIDATE_SECS im Modul-Scope zwischengespeichert,
 * statt ihn als statisches Secret in der Env zu pflegen.
 *
 * Server-only: Variablen ohne NEXT_PUBLIC_-Präfix — nicht im Browser verfügbar.
 * Keine Throws: Fehler werden geloggt, Fallback-Leerwerte zurückgegeben.
 *
 * API-Referenz: https://docs.umami.is/docs/api/authentication
 * Versionsstatus: Umami 3.1.0 self-hosted (Context7, 2026-06-20).
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
const TOKEN_TTL_MS = REVALIDATE_SECS * 1000;

let cachedToken: { token: string; obtainedAt: number } | null = null;

async function loginUmami(
  apiUrl: string,
  username: string,
  password: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[umami] Login fehlgeschlagen:", res.status);
      return null;
    }
    const json = (await res.json()) as { token?: string };
    return json.token ?? null;
  } catch (err) {
    console.warn("[umami] Fehler beim Login:", err);
    return null;
  }
}

/** Liefert ein gecachtes Token oder loggt sich bei Bedarf neu ein. */
async function getUmamiToken(
  apiUrl: string,
  username: string,
  password: string,
): Promise<string | null> {
  if (cachedToken && Date.now() - cachedToken.obtainedAt < TOKEN_TTL_MS) {
    return cachedToken.token;
  }
  const token = await loginUmami(apiUrl, username, password);
  if (!token) return null;
  cachedToken = { token, obtainedAt: Date.now() };
  return token;
}

/**
 * Holt Statistikdaten der letzten 30 Tage aus Umami.
 * Fehler und fehlende Env-Vars → `available: false`, alle Zahlen 0.
 */
export async function getUmamiDashboardData(): Promise<UmamiDashboardData> {
  const apiUrl = process.env.UMAMI_API_URL;
  const username = process.env.UMAMI_ADMIN_USERNAME;
  const password = process.env.UMAMI_ADMIN_PASSWORD;
  const websiteId = process.env.UMAMI_WEBSITE_ID;

  const empty: UmamiDashboardData = {
    available: false,
    stats: { pageviews: 0, visitors: 0, visits: 0 },
    sources: [],
    topPages: [],
  };

  if (!apiUrl || !username || !password || !websiteId) return empty;

  let token = await getUmamiToken(apiUrl, username, password);
  if (!token) return empty;

  const endAt = Date.now();
  const startAt = endAt - THIRTY_DAYS_MS;
  const qs = `startAt=${startAt}&endAt=${endAt}`;
  const fetchAll = (bearer: string) => {
    const headers = { Authorization: `Bearer ${bearer}` };
    return Promise.all([
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
  };

  try {
    let [statsRes, sourcesRes, pagesRes] = await fetchAll(token);

    // Token könnte abgelaufen sein, obwohl unser Cache es noch für gültig hält
    // (Umami nennt keine feste Lebensdauer) — einmal frisch einloggen und erneut versuchen.
    if (
      statsRes.status === 401 ||
      sourcesRes.status === 401 ||
      pagesRes.status === 401
    ) {
      cachedToken = null;
      token = await getUmamiToken(apiUrl, username, password);
      if (!token) return empty;
      [statsRes, sourcesRes, pagesRes] = await fetchAll(token);
    }

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

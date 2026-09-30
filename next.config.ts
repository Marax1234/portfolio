import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { buildCsp } from "./src/lib/csp";

/**
 * Sprint 5: Payload liefert Bild-URLs vom eigenen Server (lokaler
 * staticDir-Upload). next/image optimiert nur erlaubte Remote-Quellen —
 * daher hier freigeben.
 *
 * Sprint 7: Bilder kommen jetzt direkt aus dem Object Storage (Garage lokal,
 * siehe docker-compose.dev.yml) statt vom Payload-Server — der Host aus
 * `NEXT_PUBLIC_S3_PUBLIC_URL` wird daher zusätzlich freigegeben. Komponenten
 * bleiben unverändert (Medien-Abstraktion, §0.5).
 */
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
const serverUrlObj = new URL(serverUrl);

const s3PublicUrl =
  process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "http://localhost:9102";
const s3PublicUrlObj = new URL(s3PublicUrl);

// B4 (B25 Session 21): CSP zunächst nur als Report-Only auf den Frontend-Routen.
// Werte aus der Build-Umgebung (NEXT_PUBLIC_* sind im Image eingebacken).
const csp = buildCsp({
  mediaUrl: s3PublicUrl,
  analyticsUrl: process.env.NEXT_PUBLIC_UMAMI_SRC,
  dev: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Deployment (hillerhome, siehe docs/architecture-deploy.md §3): Docker-Image
  // kopiert nur den standalone-Output, nicht node_modules.
  output: "standalone",
  // Komprimieren übernimmt Caddy (`encode zstd gzip`), sonst liefert Next gzip
  // und Caddy reicht es nur durch (B25 Session 20, Befund aus Session 4).
  compress: false,
  // Security-Header-Härtung (Security.md §7.2 — DAST prüft fehlende Header).
  // Entfernt den verräterischen X-Powered-By-Header (ZAP 10037).
  poweredByHeader: false,
  // `next dev` soll CLAUDE.md/AGENTS.md nicht bei jedem Start um einen
  // eigenen Block ergänzen; die Projektregeln stehen in CLAUDE.md.
  agentRules: false,
  // sharp lädt sein Plattform-Binary (libvips) über einen dynamisch berechneten
  // Pfad — Next.js' Datei-Tracing für `standalone` erkennt das nicht zuverlässig
  // und lässt die .so-Datei im pnpm-Store (.pnpm/@img+sharp-libvips-*) weg, was
  // erst zur Laufzeit mit ERR_DLOPEN_FAILED auffällt (docs/archive/deploy-guide-2026-06.md §7.5).
  // Setzt das flache (hoisted) node_modules aus dem Dockerfile voraus; keine
  // Globs in node_modules/.pnpm — die treffen Symlinks auf Verzeichnisse, an denen
  // Turbopack >= 16.3 mit "Is a directory" abbricht (vercel/next.js#97507).
  // detect-libc/semver: Laufzeit-Abhängigkeiten von sharp, sonst nicht getract.
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/sharp/**/*",
      "node_modules/@img/**/*",
      "node_modules/detect-libc/**/*",
      "node_modules/semver/**/*",
    ],
  },
  images: {
    // Next.js 16 blockt standardmäßig die Bild-Optimierung von lokalen IPs
    // (SSRF-Schutz, Breaking Change v16). Lokal zeigt der Object-Storage-Host
    // auf `localhost` (Garage im Docker-Container, Port-Mapping auf den
    // Host) — dev-only, daher hier bewusst erlaubt. Produktiv zeigt
    // `NEXT_PUBLIC_S3_PUBLIC_URL` auf eine echte (CDN-)Domain, nicht auf
    // eine lokale IP (siehe Sprintplan §4 „Ausblick").
    dangerouslyAllowLocalIP: true,
    // O-02: AVIF zuerst (typisch 20–30 % kleiner als WebP), WebP als Rückfall. Jede
    // Variante entsteht dank Cache-Volume nur einmal (E2). Upload-Namen sind eindeutig
    // (Payload hängt bei Kollision ein Suffix an), daher 31 Tage Cache.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    // Ohne Angabe darf der Cache 50 % der freien Platte belegen (Volume auf der Host-SSD).
    maximumDiskCacheSize: 2_000_000_000,
    remotePatterns: [
      {
        protocol: serverUrlObj.protocol.replace(":", "") as "http" | "https",
        hostname: serverUrlObj.hostname,
        port: serverUrlObj.port || undefined,
        pathname: "/**",
      },
      {
        protocol: s3PublicUrlObj.protocol.replace(":", "") as "http" | "https",
        hostname: s3PublicUrlObj.hostname,
        port: s3PublicUrlObj.port || undefined,
        pathname: "/**",
      },
    ],
  },
  // Sicherheits-Response-Header für alle Routen (Security.md §7.2). Ohne COEP
  // (bricht Cross-Origin-Medien, .zap/rules.tsv). CSP siehe unten und src/lib/csp.ts.
  async headers() {
    return [
      {
        // B4: nur Frontend-Routen, nicht /admin (Live-Preview), /api und /_next.
        source: "/((?!admin|api|_next/).*)",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: csp },
          { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
        ],
      },
      {
        source: "/:path*",
        headers: [
          // ZAP 10021 — verhindert MIME-Sniffing.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // ZAP 10020 — Clickjacking-Schutz. SAMEORIGIN (nicht DENY), damit die
          // Payload-Admin-Live-Preview ihre eigenen Same-Origin-iframes behält.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // ZAP 10063 — Permissions-Policy: nicht genutzte Browser-Features sperren.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS setzt bewusst nur Caddy (1 Jahr, includeSubDomains, ohne preload),
          // einmal für alle Subdomains und auch auf Fehlerseiten. Hier nicht wieder
          // ergänzen, sonst kommt der Header doppelt (Ops-Repo, B25 B3/C2).
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);

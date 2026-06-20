import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * Sprint 5: Payload liefert Bild-URLs vom eigenen Server (lokaler
 * staticDir-Upload). next/image optimiert nur erlaubte Remote-Quellen —
 * daher hier freigeben.
 *
 * Sprint 7: Bilder kommen jetzt direkt aus dem Object Storage (MinIO lokal,
 * siehe docker-compose.dev.yml) statt vom Payload-Server — der Host aus
 * `NEXT_PUBLIC_S3_PUBLIC_URL` wird daher zusätzlich freigegeben. Komponenten
 * bleiben unverändert (Medien-Abstraktion, §0.5).
 */
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
const serverUrlObj = new URL(serverUrl);

const s3PublicUrl =
  process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "http://localhost:9000/portfolio-media";
const s3PublicUrlObj = new URL(s3PublicUrl);

const nextConfig: NextConfig = {
  // Deployment (hillerhome, siehe deploy.md §7): Docker-Image kopiert nur
  // den standalone-Output, nicht node_modules.
  output: "standalone",
  // Security-Header-Härtung (Security.md §7.2 — DAST prüft fehlende Header).
  // Entfernt den verräterischen X-Powered-By-Header (ZAP 10037).
  poweredByHeader: false,
  // sharp lädt sein Plattform-Binary (libvips) über einen dynamisch berechneten
  // Pfad — Next.js' Datei-Tracing für `standalone` erkennt das nicht zuverlässig
  // und lässt die .so-Datei im pnpm-Store (.pnpm/@img+sharp-libvips-*) weg, was
  // erst zur Laufzeit mit ERR_DLOPEN_FAILED auffällt (siehe deploy.md §14).
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/sharp/**/*",
      "node_modules/@img/**/*",
      "node_modules/.pnpm/@img+**/**/*",
      "node_modules/.pnpm/sharp@**/**/*",
    ],
  },
  images: {
    // Next.js 16 blockt standardmäßig die Bild-Optimierung von lokalen IPs
    // (SSRF-Schutz, Breaking Change v16). Lokal zeigt der Object-Storage-Host
    // auf `localhost` (MinIO im Docker-Container, Port-Mapping auf den
    // Host) — dev-only, daher hier bewusst erlaubt. Produktiv zeigt
    // `NEXT_PUBLIC_S3_PUBLIC_URL` auf eine echte (CDN-)Domain, nicht auf
    // eine lokale IP (siehe Sprintplan §4 „Ausblick").
    dangerouslyAllowLocalIP: true,
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
  // Sicherheits-Response-Header für alle Routen (Security.md §7.2). Bewusst
  // ohne CSP/COEP: ein zu strenger CSP würde Payload-Admin/Live-Preview, Umami
  // und die HLS-/MinIO-Cross-Origin-Medien brechen — diese beiden sind in
  // .zap/rules.tsv begründet als IGNORE dokumentiert (Follow-up).
  async headers() {
    return [
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
          // Greift produktiv hinter HTTPS (Caddy); über http lokal ignorieren Browser ihn.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);

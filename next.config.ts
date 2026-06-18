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
};

export default withPayload(nextConfig);

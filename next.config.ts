import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * Sprint 5: Payload liefert Bild-URLs vom eigenen Server (lokaler
 * staticDir-Upload). next/image optimiert nur erlaubte Remote-Quellen —
 * daher hier freigeben. Sprint 7 ersetzt die Quelle durch den
 * Object-Storage-/CDN-Host, ohne dass Komponenten sich ändern.
 */
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
const serverUrlObj = new URL(serverUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: serverUrlObj.protocol.replace(":", "") as "http" | "https",
        hostname: serverUrlObj.hostname,
        port: serverUrlObj.port || undefined,
      },
    ],
  },
};

export default withPayload(nextConfig);

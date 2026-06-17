"use client";

/**
 * <RefreshRouteOnSave> — Live Preview (Sprint 6, save-triggered).
 *
 * Eingebunden auf der Journal-Detailseite. Beim Speichern eines Beitrags im
 * Admin (`JournalPosts.admin.livePreview`) löst Payload ein `postMessage` an
 * dieses iframe-Fenster aus; dieser Wrapper ruft daraufhin `router.refresh()`
 * auf — die RSC-Seite holt die geänderten Daten erneut, ohne dass die Seite
 * selbst zur Client-Komponente werden muss (§0.6 RSC-Standard).
 *
 * Quelle: Payload-Doku „Live Preview — Server Components" (Context7, §0.3).
 */
import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

export default function RefreshRouteOnSave() {
  const router = useRouter();

  return (
    <PayloadLivePreview
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL ?? ""}
    />
  );
}

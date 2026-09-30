# Sprint-8-Übergabe — Video-Loops & HLS-Wiedergabe

**Datum:** 2026-06-18
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- **`pnpm db:up` → `pnpm seed` → `pnpm dev`** → `http://localhost:3000`:
  - **Startseite:** Hero zeigt den stummen Autoplay-Loop aus `info/Video.mp4` (1080/720/480p-ABR
    via hls.js), Mist-Blue-Tint `bg-mist-blue/15`, edge-to-edge, keine sichtbaren Controls.
    Poster-Fallback (`poster.jpg`) liegt darunter bis `canplay`. Lazy-load über
    `IntersectionObserver` (erst starten, wenn im Viewport).
  - **`/journal/marokko-2024`:** Video-Block mit HLS-Loop in `rounded-xl`-16:9-Wrapper;
    Controls erscheinen auf Hover. Bildunterschrift erhalten.
  - Safari (ManagedMediaSource): natives HLS über `video.src`; alle anderen Browser: hls.js.
- **Master-Playlist:** `curl http://localhost:9100/portfolio-media/videos/hls/1/master.m3u8`
  → 3 Varianten (1920×1080 / 1280×720 / 854×480), 6-Sekunden-Segmente, VOD-Typ.
- **Poster:** `http://localhost:9100/portfolio-media/videos/hls/1/poster.jpg` → 200, ~200 KB JPEG.
- **Admin → Videos:** neue Collection sichtbar, `status=Bereit` für das Seed-Video,
  `hlsUrl`/`posterUrl` automatisch gesetzt.
- **Admin-Upload-Pfad:** Admin → Videos → neues Video hochladen → afterChange-Hook startet
  Transkodierung fire-and-forget → `status` wechselt zu `Bereit` (oder `Fehler`) nach Abschluss.
- **Token-/Hex-Audit:** beide Greps leer. `pnpm check` grün.
- **`pnpm build`** erfolgreich; alle Routen statisch/SSG wie zuvor.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| `VideoLoop` lädt hls.js synchron im `useEffect` — kein Streaming-Preload | `src/components/VideoLoop.tsx` | Deployment (CDN + HTTP/2 push, oder bei Bedarf) |
| `controls`-Sichtbarkeit über `useState` (re-render) — könnte CSS-only sein | `VideoLoop.tsx` | optional, kein Blocker |
| Transkodierung fire-and-forget ohne persistente Queue — Absturz/Neustart verliert laufende Jobs | `src/lib/video/transcode.ts`, `src/collections/Videos.ts` afterChange-Hook | Produktiv: Payload Jobs Queue (v3 experimental → sobald stabil) |
| Kein CDN — HLS-Segmente kommen direkt aus MinIO-localhost | `NEXT_PUBLIC_S3_PUBLIC_URL` in `.env` | Deployment (CDN-Pull-Zone, Sprintplan §4) |
| Seed: Videos-Doc hat `status=processing` in der DB, solange Transkodierung läuft | `src/seed/index.ts` | wird bei jedem Seed idempotent aufgelöst |
| `/kontakt`-Formular ohne Verarbeitung | `SplitCTA`-CTAs, Footer | **Sprint 9** |

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### `videos`-Collection — `src/collections/Videos.ts`
Upload-Collection mit `mimeTypes: ["video/*"]`, kein `imageSizes`. Felder:
`title` (Pflicht), `alt` (Pflicht), `status` (`processing|ready|error`), `hlsUrl`, `posterUrl`,
`width`, `height`, `duration` (alle readonly nach Transkodierung).
S3-Storage-Plugin routet Originale unter `videos/<file>` in den Bucket. Abgeleitete
HLS-Ausgaben liegen unter `videos/hls/<id>/`.

### `transcodeVideo(payload, videoId)` — `src/lib/video/transcode.ts`
Voll-Pipeline: Download → ffprobe → FFmpeg (Docker) → S3-Upload → `payload.update`.
Aufrufbar vom Hook (fire-and-forget) **und** vom Seed (awaited). Guard über
`context.skipTranscode: true` in `payload.create/update` verhindert Endlosschleifen.

### `isFfmpegAvailable()` — `src/lib/video/ffmpeg-docker.ts`
Prüft Docker + Image (`FFMPEG_DOCKER_IMAGE`). Für Seed-Guard und Gesundheitsprüfungen.

### `payloadVideoRef(doc)` — `src/lib/media/video.ts` (re-exportiert via `src/lib/media/index.ts`)
Wandelt ein populiertes `videos`-Upload-Feld in `ResolvedVideo | undefined` um.
Gibt `undefined` zurück, wenn `status !== "ready"` oder `hlsUrl` fehlt.

### `VideoLoop` — `src/components/VideoLoop.tsx`
Props: `video: ResolvedVideo`, `posterSrc?`, `posterAlt?`, `variant: "hero" | "block"`,
`className`. `"use client"`. hls.js lazy-loaded per IntersectionObserver.

### HLS-Layout im Bucket
```
videos/hls/<videoId>/
  master.m3u8          # Master-Playlist (alle Varianten)
  stream_0/playlist.m3u8 + seg_*.ts   # 1080p
  stream_1/playlist.m3u8 + seg_*.ts   # 720p
  stream_2/playlist.m3u8 + seg_*.ts   # 480p
  poster.jpg           # Poster-Frame (t=1s)
```
Alle URLs öffentlich erreichbar über `NEXT_PUBLIC_S3_PUBLIC_URL`.

### Env-Verträge
`FFMPEG_DOCKER_IMAGE` (Default: `jrottenberg/ffmpeg:6.1-ubuntu2204`) — ergänzt die S3_*-Vars
aus Sprint 7. In `.env` und `.env.example` dokumentiert.

---

## 4. Verifikation durchgeführt

- **Context7 (§0.3):** `hls.js` (`/video-dev/hls.js`) — native HLS-Fallback Safari via
  `ManagedMediaSource + canPlayType`, `loadSource/attachMedia`, `destroy()`-Cleanup; FFmpeg
  (`/websites/ffmpeg_ffmpeg-all`) — `-var_stream_map`, `-hls_time`, `-hls_flags independent_segments`,
  `-master_pl_name`, closed GOP — vor und während der Umsetzung gezogen.
- **Token-Audit:** beide Greps leer (kein Hardcode). `pnpm check` grün (tsc + eslint).
- **Build:** `pnpm build` erfolgreich. Alle Routen statisch/SSG wie zuvor.
- **HLS-Verifikation (curl):** Master-Playlist (`master.m3u8`) → 3 Varianten + Segmente (200);
  Poster (`poster.jpg`) → 200, ~200 KB JPEG.
- **HTTP-Routes:** `/`, `/journal/marokko-2024`, `/arbeiten`, `/ueber`, `/journal` → alle 200.
- **Seed-Idempotenz:** zweiter `pnpm seed`-Lauf überspringt bereits existierende Docs korrekt
  (Videos-Doc status=ready → kein Re-Transcode; SiteConfig.hero.video bereits gesetzt → kein
  Update; Journal-Block bereits vorhanden → kein Duplikat).
- **Kein visueller Browser-Check** — wie Sprint 3–7 REST/curl-basierte Verifikation (kein
  Headless-Chromium verfügbar).

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- **Fire-and-forget ohne persistente Queue:** Der afterChange-Hook startet die Transkodierung
  ohne Absicherung gegen Neustart/Absturz. Für Produktion: Payload Jobs Queue (v3 `experimental`,
  wird stabil in 4.x laut Payload-Roadmap). Bis dahin: Status `processing`/`error` im Admin
  sichtbar; manueller Retry via Admin-Re-Save oder erneuter Upload.
- **Seed: zwei NotFound-Fehler im Log** beim allerersten `pnpm seed` (vor dem Fix mit
  `skipTranscode: true`). Nach dem Fix startet der Hook nicht mehr beim Seed-Create. Auf einer
  frischen DB (nach diesem Sprint) ist das Problem behoben.
- **WSL2-Mount-Scope:** `/tmp`-Pfade sind in dieser Umgebung für den Docker-Daemon mountbar.
  Auf anderen Setups ggf. `TMPDIR` anpassen (in `ffmpeg-docker.ts` konfigurierbar).
- **Audio:** Das Test-Video hat eine Tonspur; der Transkoder erkennt sie via ffprobe und
  kodiert Audio mit AAC 128k. Stumme Loops (kein Audio) werden korrekt erkannt und ohne
  `-map 0:a`-Argumente verarbeitet.
- **Kein CDN** (wie in Sprint 7): HLS-Segmente kommen direkt aus MinIO-localhost.
  Im Deployment: CDN-Pull-Zone vor Object Storage (Sprintplan §4 Ausblick).
- **Keine Browser-Screenshot-Verifikation** — wie Sprint 3–7.

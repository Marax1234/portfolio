# Sprint-7-Übergabe — Bild-Pipeline & Object Storage (MinIO)

**Datum:** 2026-06-18
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- `pnpm db:up` startet jetzt **Postgres + MinIO** (`docker-compose.dev.yml`).
  Ein einmaliger Bootstrap-Container (`createbuckets`) legt den Bucket
  `portfolio-media` an, setzt eine Public-Read-Policy und lädt den
  statischen Manifest-Platzhalter (`static/placeholder.svg`) hoch — alles
  idempotent bei jedem `pnpm db:up`.
- `pnpm generate:types` → `pnpm generate:importmap` → `pnpm seed` →
  `pnpm dev` → `http://localhost:3000`.
- **Uploads landen im Object Storage, nicht im App-Container:** Admin →
  `media` → Datei hochladen → erscheint im MinIO-Bucket (Web-Console
  `http://localhost:9101`, minioadmin/minioadmin), das lokale
  `media/`-Verzeichnis existiert zur Laufzeit nicht mehr (verifiziert per
  REST-Upload + `mc ls` + direktem Abruf der Datei von MinIO; nach Löschen
  des Docs verschwindet die Datei ebenfalls aus dem Bucket).
- **Frontend lädt direkt aus MinIO:** `/`, `/arbeiten`, `/arbeiten/[slug]`,
  `/ueber`, `/journal`, `/journal/[slug]`, `/komponenten` zeigen Bilder mit
  `src`/`srcSet`, die auf `http://localhost:9100/portfolio-media/...`
  zeigen — next/image liefert dabei ein Multi-Width-`srcSet` (z. B. 256w
  bis 3840w; 256w-Variante ≈2 KB vs. 1920w-Variante ≈50 KB, also sichtbar
  kleinere Bilder mobil).
- **Beide Medien-Pfade verifiziert:**
  - CMS-Upload-Pfad (`payloadMediaRef`): Original + `imageSizes`-Varianten
    (`thumbnail`/`card`/`hero`) liegen im Bucket, next/image-Proxy
    (`/_next/image?...`) liefert sie optimiert aus.
  - Manifest-`id`-Pfad (`<Media id="...">`, z. B. ProjectCard-Fallback auf
    `/komponenten`): liefert jetzt `static/placeholder.svg` direkt aus
    MinIO (unoptimiert, wie zuvor mit dem lokalen SVG).
- **Aufrufende Komponenten unverändert** (Beleg der Abstraktion):
  `git diff --stat` zeigt keine Änderung an `Media.tsx`, `payload.ts`
  (Bridge), `types.ts` oder irgendeiner Seite/Komponente — nur die
  Provider-Implementierung, der Single-Export-Point, das Collection-Plugin
  und Infra/Config wurden angepasst.
- `pnpm check` (`tsc --noEmit` + `eslint src/`) und `pnpm build` grün
  (`/journal/[slug]` weiterhin SSG mit 3 Pfaden, `/arbeiten/[slug]` mit 6).
- `pnpm build` + `pnpm start` einmal probeweise gegen MinIO verifiziert
  (Produktions-Build lädt Bilder ebenfalls korrekt aus dem Storage).
- **Token-Wechsel-Test durchgeführt:** `--color-primary` testweise auf
  `#ff00ff` geändert → erschien als `#f0f` im kompilierten CSS-Chunk →
  zurückgesetzt.
- **Hex-Audit:** beide Audit-Greps (`style={{...}}` und `className="...[#...]"`)
  leer.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| MinIO-Dev-Credentials (`minioadmin`/`minioadmin`) sind Klartext-Defaults | `docker-compose.dev.yml`, `.env` | Deployment (produktiver S3-Anbieter, siehe Sprintplan §4 „Ausblick") |
| Video-Block (`VideoBlockView.tsx`) rendert weiterhin nur das `poster`-Standbild | `src/components/journal/blocks/VideoBlockView.tsx` | **Sprint 8** (HLS-Player) |
| `/kontakt`-Formular liefert noch keine Verarbeitung | `SplitCTA`-CTAs, Footer-Links | **Sprint 9** |
| Direkte MinIO-URLs statt CDN | `generateFileURL` in `payload.config.ts`, `NEXT_PUBLIC_S3_PUBLIC_URL` | Deployment (CDN-Pull-Zone vor Object Storage, bewusst nicht selbst betrieben) |
| Manifest-`id`-Branch zeigt für alle Slots auf dasselbe SVG (`static/placeholder.svg`) | `src/lib/media/object-storage-provider.ts` | bleibt so, bis echte Slot-spezifische Assets vorliegen (kein fester Folge-Sprint) |

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### S3-Storage-Plugin — `src/payload.config.ts` (neu: `plugins`-Array)
`s3Storage({ collections: { media: { disablePayloadAccessControl: true,
generateFileURL } }, bucket, config: { endpoint, region, forcePathStyle,
credentials } })`. `generateFileURL` baut die öffentliche URL aus
`NEXT_PUBLIC_S3_PUBLIC_URL` + `prefix`/`filename` — wird pro Original **und**
pro `imageSize`-Variante aufgerufen. `disableLocalStorage` wird vom Plugin
automatisch gesetzt; `src/collections/Media.ts` bleibt schemastabil
(`staticDir` ist nur noch ein nicht mehr beschriebener Default-Wert).

### `objectStorageProvider` — `src/lib/media/object-storage-provider.ts` (neu)
Implementiert `MediaProvider` (gleiche Schnittstelle wie `local-provider.ts`).
Gleiche Slot-IDs/Maße/Alt-Texte wie zuvor, `src` zeigt jetzt auf
`${NEXT_PUBLIC_S3_PUBLIC_URL}/static/placeholder.svg`. `src/lib/media/index.ts`
exportiert `mediaProvider` jetzt von hier (vorher `local-provider.ts`,
bleibt als Referenz im Repo, nicht mehr aktiv).

### Env-Verträge — `.env` / `.env.example` (neu)
`S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`,
`S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`, `NEXT_PUBLIC_S3_PUBLIC_URL`.
Letztere ist die einzige Variable, die Frontend (next.config.ts,
object-storage-provider.ts) **und** Backend (payload.config.ts) gemeinsam
nutzen — Folge-Sprints, die weitere Storage-Hosts brauchen, docken hier an.

### `next.config.ts`: zweiter `remotePatterns`-Eintrag + `dangerouslyAllowLocalIP`
Der MinIO-Host wird zusätzlich zum bestehenden Payload-Server-Host
freigegeben. **Wichtig:** Next.js 16 blockt standardmäßig die
Bild-Optimierung für lokale IPs (SSRF-Schutz, Breaking Change v16) — dev-only
über `images.dangerouslyAllowLocalIP: true` erlaubt, da `localhost` lokal auf
127.0.0.1 aufgelöst wird. Produktiv zeigt `NEXT_PUBLIC_S3_PUBLIC_URL` auf
eine echte (CDN-)Domain, keine lokale IP — die Einstellung bleibt aber aktiv
und sollte bei einem produktiven Self-Hosting in einem VPC mit
Split-Horizon-DNS erneut bewertet werden (siehe Next.js-Migrationsleitfaden).

### Docker-Infra — `docker-compose.dev.yml`
Neue Services `minio` (Host-Ports **9100**/**9101**, nicht 9000/9001 — auf
dieser Maschine belegt ein anderer Container Port 9000) und `createbuckets`
(One-Shot-Bootstrap). `pnpm db:up`/`pnpm db:down` steuern beide zusammen mit
Postgres.

---

## 4. Verifikation durchgeführt

- **Context7 (§0.3):** Doku zu `@payloadcms/storage-s3` (Konfiguration,
  MinIO/R2-Endpoint-Muster, `disablePayloadAccessControl` +
  `generateFileURL`) und zu Next.js 16 (`remotePatterns`,
  `dangerouslyAllowLocalIP`, Breaking Changes v16) vor und während der
  Umsetzung gezogen.
- **Token-Audit + Token-Wechsel-Test:** siehe Abschnitt 1 — bestanden.
- **Qualität:** `pnpm check` (`tsc --noEmit` + `eslint src/`) — beide grün.
- **Build:** `pnpm build` — erfolgreich, alle Routen wie zuvor statisch/SSG;
  `pnpm start` einmal gegen den laufenden MinIO-Container verifiziert.
- **Funktional (HTTP):** `/`, `/arbeiten`, `/arbeiten/[slug]`, `/ueber`,
  `/journal`, `/journal/[slug]`, `/komponenten`, `/admin` → 200.
- **Storage-Funktional (REST):**
  - Admin-Login (REST) → Upload eines Test-Bildes via
    `POST /api/media` (`_payload` + `file`) → `doc.url` zeigt auf MinIO →
    Datei per direktem `curl` gegen MinIO abrufbar (200).
  - `DELETE /api/media/<id>` → Datei verschwindet aus MinIO (404 danach).
  - `mc ls -r local/portfolio-media` zeigt Original **und** alle drei
    `imageSizes`-Varianten (400×300/800×600/1600×900) des Seed-Platzhalters.
- **Migration bestehender Daten:** Die Seed-Datenbank enthielt aus Sprint
  1–6 noch einen lokalen SVG-Upload (Payload berechnet `url`/`sizes.*.url`
  zur Lesezeit aus dem gespeicherten `filename` — unabhängig davon, ob die
  Bytes real im Storage liegen). Das Seed-Skript erkennt diesen Zustand
  (fehlende `sizes.thumbnail.filename`) und migriert ihn per
  `payload.update` mit neuem Datei-Buffer auf dieselbe ID — alle
  bestehenden Referenzen (Projekte, Journal, AboutPage, SiteConfig) bleiben
  gültig. Zweiter `pnpm seed`-Lauf bestätigt Idempotenz (kein erneuter
  Re-Upload).
- **Browser-Screenshot-Verifikation:** wie in Sprint 3–6 nicht durchgeführt
  (Chromium-Headless in dieser Umgebung nicht verfügbar) — Verifikation
  stattdessen über `curl`/REST gegen den laufenden Dev-/Prod-Server sowie
  direkte Abrufe gegen die MinIO-S3-API.

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- **MinIO-Host-Ports auf 9100/9101 statt der Defaults 9000/9001:** Auf
  dieser Entwicklungsmaschine belegt bereits ein anderer Container
  (Portainer) Port 9000. Container-intern läuft MinIO weiterhin auf
  9000/9001 — nur die Host-Port-Zuordnung in `docker-compose.dev.yml` und
  die `S3_ENDPOINT`/`NEXT_PUBLIC_S3_PUBLIC_URL`-Werte in `.env`/`.env.example`
  wurden entsprechend angepasst. Auf einer anderen Maschine ohne diese
  Kollision könnten die Standardports verwendet werden.
- **`dangerouslyAllowLocalIP: true`** ist eine Next.js-16-Sicherheitsausnahme
  (SSRF-Schutz) — für lokale Entwicklung mit `localhost`-MinIO notwendig
  und im Kommentar dokumentiert. In Produktion zeigt der Storage-Host auf
  eine echte Domain, nicht auf eine lokale IP; die Einstellung sollte beim
  Deployment dennoch bewusst erneut geprüft werden.
- **Next.js Data Cache (`unstable_cache`) ist Disk-persistent über
  Dev-Server-Neustarts hinweg:** Da das Seed-Skript (wie schon in
  Sprint 4–6) `context: { disableRevalidate: true }` setzt (Standalone-Skript
  ohne Static-Generation-Store), wird der Cache durch `pnpm seed` nicht
  invalidiert. Während der Verifikation musste `.next/` einmal gelöscht
  werden, um einen alten, vor der Migration zwischengespeicherten
  Payload-Doc (mit der alten Proxy-URL) loszuwerden. Im normalen Betrieb
  (Inhaltspflege über das Admin-UI statt Seed) läuft die Revalidierung über
  die bestehenden Hooks (`src/hooks/revalidate.ts`) und ist nicht betroffen.
- **Vorbestehende Repo-Inkonsistenz entdeckt (nicht durch Sprint 7
  verursacht):** `src/lib/media/payload.ts` (die Payload-Bridge aus Sprint 5)
  wurde laut `git log` in Commit `e24ca11` („sprint 5") committet, ist aber
  aktuell **nicht** im Git-Index von `HEAD` enthalten (`git show
  HEAD:src/lib/media/payload.ts` → „exists on disk, but not in HEAD"). Die
  Datei ist im Arbeitsverzeichnis vorhanden und funktional notwendig (von
  `index.ts` reexportiert), aber derzeit ungetrackt. Zusätzlich enthielt
  `.gitignore` ein nicht verankertes `media/`-Pattern, das versehentlich auch
  `src/lib/media/` erfasst hat — dadurch blieb auch die neue
  `object-storage-provider.ts` unsichtbar für `git status`. Das
  `.gitignore`-Pattern wurde auf `/media/` (Repo-Root-verankert) korrigiert;
  **`payload.ts` und `object-storage-provider.ts` sind aber weiterhin nicht
  von `git add`/`git commit` erfasst worden** (kein Commit wurde in diesem
  Sprint angefordert) — vor dem nächsten Commit unbedingt `git status`
  prüfen und beide Dateien stagen, sonst geht die Medien-Abstraktion beim
  nächsten Commit unvollständig in den Verlauf ein.
- Kein manueller visueller Browser-Check (Screenshot) in dieser Session —
  wie bereits in Sprint 3–6 nur REST-/HTTP-/`mc`-basierte Verifikation.

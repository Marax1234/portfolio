# Sprint-4-Übergabe — Payload-Datenmodell & Admin

**Datum:** 2026-06-17
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- `pnpm db:up` → lokale Dev-Postgres startet (Docker, nur DB-Container).
- `pnpm dev` → `http://localhost:3000/admin` zeigt das **Payload-3-Admin-Panel**.
  Login mit dem Seed-Admin (siehe §5) funktioniert; alle Collections
  (Projekte, Journal-Beiträge, Medien, Kontaktanfragen, Benutzer) und das
  Global „Seiten-Konfiguration“ sind sichtbar und **ohne Code** editier-/
  anlegbar.
- `pnpm seed` legt idempotent ein Beispiel-Projekt
  („Triathlon EM 2024 — Hamburg“, featured), einen Beispiel-Journalbeitrag
  („Durch Marokko — 14 Tage, 2.400 km“) und SiteConfig-Defaults
  (Hero/Intro/Tiles/Facts/CTAs aus den Sprint-3-Platzhaltertexten) an.
  Erneutes Ausführen verändert/dupliziert nichts.
- Bestehende Frontend-Routen (`/`, `/komponenten`, `/styleguide`) liefern
  weiterhin HTTP 200 und sind unverändert — die Payload-Integration läuft
  über eine separate `(payload)`-Route-Group, ohne bestehende URLs zu
  berühren.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| Frontend liest weiterhin aus den Sprint-3-Hardcodes in `src/components/home/*.tsx`, **nicht** aus Payload | Komponenten-intern | **Sprint 5** |
| Media-Collection schreibt lokal nach `media/` (`staticDir`) | `src/collections/Media.ts` | **Sprint 7** (Object-Storage-Plugin) |
| Journal-Beiträge nutzen nur einfachen Lexical-Richtext (`body`), kein Block-System | `src/collections/JournalPosts.ts` | **Sprint 6** |
| Kontaktanfragen-Collection ist nur Datenmodell, kein Formular/Mail-Versand | `src/collections/ContactSubmissions.ts` | **Sprint 9** |
| Seed-Platzhalterbild für alle Beispiel-Inhalte (`Seed-Platzhalter`, identisch zum lokalen Media-Fallback aus Sprint 1) | `src/seed/index.ts` | wird durch echte Uploads im Admin oder in Sprint 5/7 ersetzt |

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### Collections — Slugs & Feldnamen
```
users               { email, password (auth), roles: ('admin'|'editor')[] }
media               { alt, url, sizes.{thumbnail,card,hero} } (upload)
projects            { title, slug, category, cover (→media), excerpt, body
                       (richText), featured, ctaLabel, ctaHref, order,
                       publishedAt }
journal             { title, slug, category, cover (→media), body
                       (richText), order, publishedAt }
contact-submissions { name, email, message, read, createdAt }
```
`category` (projects): `hochzeiten | menschen | reisen | sport | commercial`
`category` (journal): `reise | sport | behind-the-scenes | sonstiges`

Feldshape ist bewusst kompatibel zu `ProjectCardProps`
(`src/components/ui/ProjectCard.tsx`: `id/title/meta/href`) und zur
`FeaturedSection` (`cover/title/body/ctaLabel/ctaHref`) gehalten — Sprint 5
mappt `category` + `publishedAt` zu `meta` und `cover` zu einem `<Media>`-Slot,
ohne dass Komponenten-Props sich ändern.

### Global — `site-config`
```
hero        { eyebrow, name, tagline, scrollHint, poster (→media) }
intro       { eyebrow, portrait (→media), body (richText) }
whatIDoTiles[] { label, href, media (→media) }   (max. 3, deckt WhatIDoSection)
facts[]     { value, label }                      (deckt FactsStrip)
ctaLeft     { headline, subline, buttonLabel, buttonHref }
ctaRight    { headline, subline, buttonLabel, buttonHref }
```
Deckt alle in Sprint 3 inline-hartkodierten Singleton-Inhalte der Startseite ab.

### Payload-Konfiguration
- `src/payload.config.ts` — Postgres-Adapter, Lexical-Editor, Collections/
  Globals-Registry, `typescript.outputFile: src/payload-types.ts`.
- `next.config.ts` — `withPayload(nextConfig)`.
- `src/app/(payload)/**` — generierte Payload-Boilerplate (Admin-UI, REST-/
  GraphQL-Routen). Route-Group ändert keine bestehenden URLs.
- `@payload-config`-Alias in `tsconfig.json` → `./src/payload.config.ts`.
- `PAYLOAD_CONFIG_PATH=src/payload.config.ts` in allen `payload`-bezogenen
  npm-Scripts (CLI sucht sonst im Repo-Root).

### Generierte Typen
`src/payload-types.ts` (per `pnpm generate:types`, committed) — Sprint 5
importiert `import type { Project, JournalPost, SiteConfig } from "@/payload-types"`
beim Bau der Daten-Queries.

---

## 4. Verifikation durchgeführt

- **Token-Audit:** `grep` auf Hex-Werte in `style={}`/`className` über `src/` —
  leer, kein Treffer. (Die Hardcode-Regel betrifft Frontend-Komponenten;
  generierte Payload-Boilerplate/`payload.config.ts` ist davon nicht
  betroffen — kein Design-Token-Styling.)
- **Qualität:** `pnpm check` (`tsc --noEmit` + `eslint src/`) — beide grün.
- **DB/Schema:** `pnpm db:up` (Docker-Postgres) + `pnpm seed` laufen
  fehlerfrei; zweiter `pnpm seed`-Lauf bestätigt Idempotenz (alle Schritte
  „bereits vorhanden — übersprungen“).
- **Admin/API (Browser-Ersatz):**
  - `GET /` , `/komponenten`, `/styleguide` → HTTP 200 (Frontend unverändert).
  - `GET /admin` → HTTP 200 (Login-Maske rendert).
  - `POST /api/users/login` mit Seed-Credentials → `200 Authentication Passed`.
  - Authentifizierte `GET /api/projects`, `/api/journal`,
    `/api/globals/site-config`, `/api/media` → liefern die Seed-Inhalte.
  - Authentifizierter `POST /api/projects` (neues Dokument anlegen) und
    `DELETE` → `201`/`200`, danach wieder bereinigt — belegt
    No-Code-Anlegen/Bearbeiten ohne Browser-Screenshot.
- **Browser-Screenshot-Verifikation:** wie in Sprint 3 nicht durchgeführt
  (Chromium-Headless in dieser Umgebung nicht verfügbar) — Verifikation
  stattdessen über authentifizierte REST-Aufrufe + direkte Postgres-Abfrage
  der Seed-Daten.

---

## 5. Zugangsdaten & Setup (nur lokal)

- DB hochfahren: `pnpm db:up` (stoppen: `pnpm db:down`).
- `.env` (lokal, **nicht committed** — `.env.example` als Vorlage):
  `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`,
  `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.
- Seed-Admin (lokal, nur Dev): `admin@kilia-siebert.de` /
  `changeme123` (Default aus `.env.example` — vor jedem produktiven Schritt
  ändern, gilt ausdrücklich nur für lokale Entwicklung).
- Reihenfolge bei frischem Setup: `pnpm install` → `pnpm db:up` →
  `pnpm generate:types` → `pnpm generate:importmap` → `pnpm seed` →
  `pnpm dev`.

---

## 6. Bekannte offene Punkte / bewusste Auslassungen

- `sharp`-Typdiskrepanz (`SharpDependency` vs. aktuelle `sharp`-Typings) in
  `src/payload.config.ts` mit explizitem, kommentiertem Type-Cast umgangen —
  Laufzeitverhalten unverändert, nur ein TS-Strukturtyp-Konflikt.
- `package.json` musste auf `"type": "module"` umgestellt werden (Payloads
  ESM-`payload.config.ts` mit `import.meta.url` erfordert das unter
  Node 22 für `payload generate:types`/`run`); Next.js/Tailwind/ESLint
  liefen ungeändert weiter (alle bereits ESM-kompatibel).
  `typescript` wurde zusätzlich auf `^6` angehoben (aktueller Stand der
  Payload-/Next-Ökosystem-Typings).
- `pnpm-workspace.yaml`-Platzhalter (`allowBuilds: ... "set this to true
  or false"`) aus Sprint-1-Setup aufgelöst — `sharp`, `unrs-resolver`,
  `esbuild` jetzt explizit auf `true`.
- Kein Voll-Theming des Admin-Panels (Schritt 6 im Plan war ausdrücklich
  optional/klein) — `custom.scss` ist ein leerer Platzhalter.
- Keine feingranulare Access-Control je Rolle (`roles`-Feld ist nur
  vorbereitet, siehe Sprintplan §0.5 „Vorausschau“).
- Kein manueller visueller Browser-Check (Screenshot) in dieser Session —
  nur REST-/DB-basierte Verifikation, wie bereits in Sprint 3.

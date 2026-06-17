# Sprint-6-Übergabe — Journal mit Blocks & Live Preview

**Datum:** 2026-06-17
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- `pnpm db:up` → `pnpm generate:types` → `pnpm generate:importmap` →
  `pnpm seed` → `pnpm dev` → `http://localhost:3000`.
- **`/journal`** (neu): chronologischer Feed — großes Cover, Titel,
  Kategorie/Datum, 2-Zeilen-Teaser, mobile-first eine Spalte (Konzept §4.4).
- **`/journal/[slug]`** (neu): Cover-Hero, Kontextblock, frei komponiertes
  **Block-Layout** (Text/Bild/Galerie/Zwei-Spalten/Zitat/Video — alle 3
  Seed-Beiträge nutzen unterschiedliche Block-Kombinationen), verwandte
  Beiträge (geteilte `ProjectCard`), dezenter Social-Hinweis, Prev/Next —
  keine Sackgasse, unbekannter Slug → 404 (geprüft).
  `generateStaticParams` erzeugt alle 3 Slugs statisch (`pnpm build` geprüft).
- **Admin:** Journal-Beitrag im Admin öffnen → `layout`-Feld erlaubt
  Hinzufügen/Umsortieren/Speichern beliebiger Blöcke ohne Code.
  `admin.livePreview`/`admin.preview` zeigen auf die echte Detailseite;
  `<RefreshRouteOnSave>` auf der Detailseite löst beim Speichern
  `router.refresh()` aus (save-triggered, RSC-Standard — kein Umbau zu
  Client-Komponenten nötig).
- **ISR/On-Demand-Revalidation verifiziert:** Journal-`excerpt` per
  authentifiziertem REST-`PATCH` geändert → Änderung erschien sofort auf
  `/journal` (Feed-Teaser), ohne Rebuild (Beweis: Testwert
  „ISR-Test: …“ erschien und wurde danach wieder entfernt).
- **Token-Wechsel-Test durchgeführt:** `--color-primary` testweise auf
  `#ff00ff` geändert → schlug im kompilierten CSS durch (`color-primary: #f0f`)
  → zurückgesetzt.
- Bestehende Routen `/`, `/arbeiten`, `/arbeiten/[slug]`, `/ueber`,
  `/komponenten`, `/styleguide`, `/admin` weiterhin HTTP 200; `pnpm check`
  (`tsc --noEmit` + `eslint`) und `pnpm build` grün.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| Alle Seed-Bilder (Cover, Block-Bilder) zeigen weiterhin auf das lokale Platzhalter-SVG (`media/`-staticDir) | `src/collections/Media.ts`, `src/seed/index.ts` | **Sprint 7** (Object-Storage-Plugin) |
| Video-Block (`src/blocks/VideoBlock.ts`, `VideoBlockView.tsx`) rendert nur das `poster`-Standbild, `data-video-slot="journal"` markiert die Austauschstelle | `src/components/journal/blocks/VideoBlockView.tsx` | **Sprint 8** (HLS-Player) |
| `/kontakt`-Formular liefert noch keine Verarbeitung (nur Link-Ziel) | `SplitCTA`-CTAs, Footer-Links | **Sprint 9** |
| Live Preview ist save-triggered (kein Keystroke-Echtzeit) — die Collection hat keine Drafts/Versions, daher spiegelt die Vorschau nur **gespeicherte** Änderungen | `src/collections/JournalPosts.ts` (`admin.livePreview`), `src/components/RefreshRouteOnSave.tsx` | bleibt bewusst so (kein Folge-Sprint vorgesehen, siehe §5) |

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### Block-Bibliothek — `src/blocks/` (neu)
`journalBlocks: Block[]` (6 Blocks: `text`, `image`, `gallery`, `twoColumn`,
`quote`, `video`) wird in `JournalPosts.layout` (`type: "blocks"`)
eingehängt. Jeder Block hat ein `interfaceName`, das generierte
TS-Interfaces erzeugt (`TextBlock`, `ImageBlock`, …, in
`src/payload-types.ts`, diskriminiert über `blockType`). Neue Blocks: Datei
in `src/blocks/` anlegen, in `journalBlocks`-Array registrieren, passende
View-Komponente in `src/components/journal/blocks/` ergänzen,
`BlockRenderer.tsx`-Switch erweitern.

### Block-Renderer — `src/components/journal/BlockRenderer.tsx` (neu)
Schaltet über `block.blockType` auf die jeweilige
`src/components/journal/blocks/*View.tsx`-Komponente. Unbekannte Typen
→ `null` (kein Absturz). Einziger erlaubter Weg, `Journal.layout` zu
rendern.

### Daten-Zugriffsschicht — `src/lib/payload.ts` (erweitert)
Neue Fetcher (alle `unstable_cache`, Tag `journal`): `getJournalPosts`
(Feed, `-publishedAt`), `getAllJournalSlugs` (`generateStaticParams`),
`getJournalNeighbors` (Prev/Next), `getRelatedJournal` (verwandte
Beiträge, bevorzugt gleiche Kategorie). Folge-Sprints, die weitere
Journal-Listenansichten brauchen, docken hier an.

### Live Preview — `src/components/RefreshRouteOnSave.tsx` (neu) + `JournalPosts.admin`
`admin.livePreview.url` / `admin.preview` zeigen auf
`${NEXT_PUBLIC_SERVER_URL}/journal/${slug}`. `<RefreshRouteOnSave>` ist
eine Client-Komponente, die in der Detailseite (Server Component) platziert
wird und nur `router.refresh()` aufruft — das Muster ist auf jede weitere
RSC-Detailseite mit Live-Preview-Bedarf übertragbar (Projekte, About).

### JournalPosts-Datenmodell — Breaking Change
Das frühere `body`-richText-Feld ist **entfernt**, durch `layout`
(Blocks) ersetzt; `excerpt` (textarea, Feed-Teaser) ist neu. Da die
Dev-Datenbank kein `body` befüllt hatte, kein Datenverlust — die
`body`-Spalte wurde direkt per SQL gedroppt (siehe §5), um Drizzles
interaktive Rename-Heuristik beim Schema-Push zu vermeiden.

---

## 4. Verifikation durchgeführt

- **Context7 (§0.3):** Doku zu Payload 3.85 Blocks-Field, `admin.livePreview`
  (global + per-collection), `admin.preview`, `RefreshRouteOnSave` für
  Server Components vor der Umsetzung gezogen.
- **Token-Audit:** `grep` auf Hex-Werte in `style={}`/`className` über
  `src/` — leer, kein Treffer.
- **Token-Wechsel-Test:** siehe Abschnitt 1 — bestanden.
- **Qualität:** `pnpm check` (`tsc --noEmit` + `eslint src/`) — beide grün.
- **Build:** `pnpm build` — erfolgreich, `/journal` statisch,
  `/journal/[slug]` als SSG mit 3 vorgenerierten Pfaden
  (`generateStaticParams`).
- **Seed:** `pnpm seed` zweimal hintereinander ausgeführt — zweiter Lauf
  bestätigt Idempotenz (alle Schritte „bereits vorhanden/befüllt —
  übersprungen"), inkl. eines Nachpflege-Pfads für die Sprint-5-Journalbeiträge
  (`excerpt`/`layout` wurden ergänzt, weil das alte Seed-Skript diese Felder
  noch nicht kannte).
- **Funktional (HTTP + Inhalt):** `/`, `/arbeiten`, `/ueber`, `/admin` → 200;
  `/journal` → 200 (Feed mit 3 Covern + Teasern); `/journal/<bekannter-slug>`
  → 200 (alle 3 Slugs, Blocks gerendert, Prev/Next, verwandte Beiträge);
  `/journal/<unbekannt>` → 404.
- **ISR-Beleg:** authentifizierter REST-`PATCH` auf `excerpt` eines
  Journal-Beitrags → Änderung erschien sofort im `/journal`-Feed, ohne
  Rebuild/Neustart — danach wieder zurückgesetzt.
- **Browser-Screenshot-Verifikation:** wie in Sprint 3–5 nicht durchgeführt
  (Chromium-Headless in dieser Umgebung nicht verfügbar) — Verifikation
  stattdessen über `curl`/REST-Aufrufe gegen den laufenden Dev-Server sowie
  `pnpm build`. Das Admin-Edit-View (`/admin/collections/journal/1`) wurde
  per HTTP-Statuscode (200) geprüft; ein interaktiver Klick-Test der
  Live-Preview-Vorschau im Browser steht noch aus.

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- **Schema-Migration manuell statt über Payload-Push gelöst:** Beim
  Entfernen von `body` und gleichzeitigem Hinzufügen von `excerpt` erkennt
  Drizzles `db push` eine mögliche Rename-Ambiguität und fragt interaktiv
  nach ("Is excerpt column … created or renamed from another column?").
  Dieses Prompt ist nicht non-interaktiv/pipebar (benötigt echtes TTY). Da
  die `body`-Spalte in der lokalen Dev-Datenbank überall leer war, wurde sie
  nutzerseitig bestätigt direkt per SQL (`ALTER TABLE journal DROP COLUMN
  body;`) entfernt, wodurch der nächste Push eindeutig wurde. Für Produktiv-
  Migrationen (außerhalb des Scopes dieses Plans, siehe „Ausblick") müsste
  stattdessen `payload migrate:create` mit expliziter Migration verwendet
  werden, nicht der Dev-Push-Modus.
- Live Preview ist **save-triggered**, nicht Keystroke-Echtzeit — bewusste
  Entscheidung (User-Bestätigung), um die Detailseite als reine Server
  Component zu belassen. Spiegelt nur gespeicherte Änderungen.
- Kein manueller visueller Browser-Check (Screenshot) in dieser Session —
  wie bereits in Sprint 3–5 nur REST-/HTTP-basierte Verifikation. Insbesondere
  wurde das Live-Preview-iframe im Admin nicht interaktiv durchgeklickt.
- `getRelatedJournal` bevorzugt gleiche Kategorie, füllt aber bei zu wenigen
  Treffern mit den nächstälteren Beiträgen unabhängig von Kategorie auf —
  bewusste Vereinfachung, da bei nur 3 Seed-Beiträgen sonst oft leer.
- Journal-Übersicht hat bewusst **keine Filter-Tabs** wie `/arbeiten`
  (Konzept §4.4 beschreibt einen chronologischen Feed, kein Kategorie-Grid).

# Sprint-5-Übergabe — Datengetriebene Seiten + ISR

**Datum:** 2026-06-17
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- `pnpm db:up` → `pnpm generate:types` → `pnpm generate:importmap` →
  `pnpm seed` → `pnpm dev` → `http://localhost:3000`.
- **Startseite (`/`)** zieht alle Inhalte aus Payload: Hero, Intro,
  „Was ich mache“-Kacheln, Featured-Projekt, Fakten-Strip (4 Werte) und
  Journal-Teaser (3 Beiträge) — keine Sprint-3-Hardcodes mehr in
  `src/app/(frontend)/page.tsx`.
- **`/arbeiten`** (neu): Grid aller 6 Seed-Projekte, Filter-Tabs
  `Alle · Hochzeiten · Menschen · Reisen · Sport · Commercial`, ein Klick zur
  Detailseite.
- **`/arbeiten/[slug]`** (neu): Hero, Kontextblock (Ort/für wen/Text),
  Bild-Strecke (Beispiel: 2 Bilder mit Captions am Triathlon-Projekt),
  Prev/Next — keine Sackgasse, unbekannter Slug → 404 (geprüft).
  `generateStaticParams` erzeugt alle 6 Slugs statisch (`pnpm build` geprüft).
- **`/ueber`** (neu): Portrait, Story, Meilenstein-Timeline (4 Einträge),
  „Was mich ausmacht“ (3 Punkte), Backstage-Grid (3 Bilder), Footer-CTAs
  „Mehr im Journal“ / „Kontakt“.
- **ISR/On-Demand-Revalidation verifiziert:** Projekt-`excerpt` per
  authentifiziertem REST-`PATCH` (simuliert Admin-Speichern) geändert →
  Änderung erschien sofort auf `/` und `/arbeiten/[slug]`, ohne Rebuild
  (Beweis: Testwert „ISR-Test: …“ erschien und wurde danach wieder entfernt).
- **Token-Wechsel-Test durchgeführt:** `--color-primary` testweise auf
  `#ff00ff` geändert → schlug in der kompilierten CSS durch → zurückgesetzt.
- Bestehende Routen `/`, `/komponenten`, `/styleguide`, `/admin` weiterhin
  HTTP 200; `pnpm check` (`tsc --noEmit` + `eslint`) und `pnpm build` grün.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| Alle Seed-Bilder zeigen weiterhin auf das lokale Platzhalter-SVG (`media/`-staticDir) | `src/collections/Media.ts`, `src/seed/index.ts` | **Sprint 7** (Object-Storage-Plugin) |
| Hero/Projekt-Detail-Medienstrecke bleibt Bild, kein Video | `src/components/home/HeroSection.tsx` (`data-video-slot="hero"`), `Project.gallery` | **Sprint 8** (HLS-Player) |
| `/journal`-Übersicht + `/journal/[slug]` existieren noch nicht — Links aus Journal-Teaser/ProjectCard führen vorerst ins Leere | `src/components/home/JournalTeaserSection.tsx`, `src/lib/navigation.ts` | **Sprint 6** (Journal mit Blocks & Live Preview) |
| `/kontakt`-Formular liefert noch keine Verarbeitung (nur Link-Ziel) | `SplitCTA`-CTAs | **Sprint 9** |
| Section-Komponenten (`HeroSection`, `IntroSection`, `WhatIDoSection`, `FeaturedSection`, `JournalTeaserSection`) behalten Sprint-3-Texte als Default-Props, falls das jeweilige Payload-Feld leer ist | `src/components/home/*.tsx` | bleibt dauerhaft als Resilienz-Fallback, kein Folge-Sprint nötig |

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### Medien-Abstraktion — erweitert (§0.5)
`MediaRef` ist jetzt `AnyMediaRef = { id: string } | { payload: PayloadImageSource }`
(`src/lib/media/types.ts`). `<Media>` und `<ProjectCard>` akzeptieren beide
Formen über Props-Spread (`{...ref}`). `payloadMediaRef(doc, { alt?, variant? })`
(`src/lib/media/payload.ts`) wandelt ein populiertes Payload-Upload-Feld
(`number | Media | null`) in eine `AnyMediaRef` um — `undefined`, wenn nicht
populiert (Aufrufer fallen dann auf einen Manifest-Slot zurück). Sprint 7
tauscht nur, was hinter `id` steckt; der `payload`-Zweig (und damit alles aus
Sprint 5) bleibt unverändert, weil `Media.url` dann direkt auf den
Object-Storage-Host zeigt.

### Daten-Zugriffsschicht — `src/lib/payload.ts` (neu)
Alle Frontend-Datenzugriffe laufen ausschließlich hier durch
(`getSiteConfig`, `getAboutPage`, `getFeaturedProject`, `getProjects`,
`getAllProjectSlugs`, `getProjectBySlug`, `getProjectNeighbors`,
`getJournalTeasers`, `getJournalBySlug`, `formatMeta`, `PROJECT_CATEGORIES`).
Jeder Fetcher ist mit `unstable_cache` unter den Tags `projects`/`journal`/
`site-config`/`about-page` gecacht. Sprint 6 kann `getJournalBySlug` direkt
für `/journal/[slug]` weiterverwenden.

### ISR — `src/hooks/revalidate.ts` (neu)
`afterChange`/`afterDelete`-Hooks auf `Projects`, `JournalPosts`,
`SiteConfig`, `AboutPage` rufen `revalidateTag`/`revalidatePath` mit genau
den obigen Tags auf. Guard: `context.disableRevalidate` (für
Standalone-Skripte außerhalb eines Next-Request-Kontexts, siehe `src/seed/index.ts`)
sowie ein `try/catch` als Sicherheitsnetz. Neue Collections/Globals mit
Frontend-Bezug sollten denselben Hook-+-Tag-Vertrag übernehmen.

### Neue Payload-Felder
```
projects.location   text, optional   — „Ort“ im Kontextblock
projects.client      text, optional   — „für wen“
projects.gallery      array { image (→media, required), caption? }
about-page (Global, neu)
  hero { eyebrow?, headline?, image (→media) }
  story            richText
  milestones[]     { year, title, description? }
  whatDefinesMe[]  { point, description? }
  backstage[]      { image (→media) }
site-config.whatIDo        group { eyebrow?, headline? }
site-config.journalTeaser  group { eyebrow?, headline? }
```
`pnpm generate:types` wurde ausgeführt, `src/payload-types.ts` ist committet.

### RichText-Rendering — `src/components/RichText.tsx` (neu)
Dünner Wrapper um `RichText` aus `@payloadcms/richtext-lexical/react`.
Einziger erlaubter Weg, `richText`-Felder darzustellen (Intro-`body`,
Projekt-`body`, About-`story`). Sprint 6 kann denselben Wrapper für
Journal-Block-Inhalte erweitern (eigene `jsxConverters` für Blocks).

### Works-Filter — `src/components/arbeiten/WorksGrid.tsx` (neu, Client-Komponente)
Nimmt bereits server-seitig gerenderte `ProjectCard`-Knoten
(`{ id, category, node }[]`) entgegen und filtert nur per State/CSS — keine
eigene Server-Komponenten-Instanziierung über die RSC-Grenze hinweg. Muster
ist wiederverwendbar für andere gefilterte Grids (z.B. falls Journal später
ebenfalls Kategorie-Tabs bekommt).

---

## 4. Verifikation durchgeführt

- **Context7 (§0.3):** Doku zu Next.js 16 On-Demand-ISR
  (`revalidatePath`/`revalidateTag`/`unstable_cache`) und Payload 3
  (`afterChange`/`afterDelete`-Hooks + Next-Revalidate-Pattern,
  `RichText`-Renderer-Import, `GlobalAfterChangeHook`) vor der Umsetzung
  gezogen; Payload-Version 3.85.x, Next.js 16.2.x bestätigt.
- **Token-Audit:** `grep` auf Hex-Werte in `style={}`/`className` über
  `src/` — leer, kein Treffer.
- **Token-Wechsel-Test:** siehe Abschnitt 1 — bestanden.
- **Qualität:** `pnpm check` (`tsc --noEmit` + `eslint src/`) — beide grün.
- **Build:** `pnpm build` — erfolgreich, `/`, `/arbeiten`, `/ueber` statisch,
  `/arbeiten/[slug]` als SSG mit 6 vorgenerierten Pfaden (`generateStaticParams`).
- **Seed:** `pnpm seed` zweimal hintereinander ausgeführt — zweiter Lauf
  bestätigt Idempotenz (alle Schritte „bereits vorhanden/befüllt —
  übersprungen“), inkl. eines Nachpflege-Pfads für das Sprint-4-Bestandsprojekt
  (`location`/`client`/`gallery` wurden ergänzt, weil das alte Seed-Skript
  diese Felder noch nicht kannte).
- **Funktional (HTTP + Inhalt):** `/`, `/komponenten`, `/styleguide`,
  `/arbeiten`, `/ueber`, `/admin` → 200; `/arbeiten/<bekannter-slug>` → 200,
  `/arbeiten/<unbekannt>` → 404; Filter-Tabs liefern alle 5 Kategorien +
  „Alle“; Homepage zeigt reale Seed-Inhalte (Fakten inkl. „∞“, Featured-Projekt
  „Triathlon EM 2024 — Hamburg“, 3 Journal-Teaser).
- **ISR-Beleg:** authentifizierter REST-`PATCH` auf das Featured-Projekt
  (`excerpt`) → Änderung erschien sofort auf `/` und der Detailseite, ohne
  Rebuild/Neustart — danach wieder zurückgesetzt.
- **Browser-Screenshot-Verifikation:** wie in Sprint 3/4 nicht durchgeführt
  (Chromium-Headless in dieser Umgebung nicht verfügbar) — Verifikation
  stattdessen über `curl`/REST-Aufrufe gegen den laufenden Dev-Server sowie
  `pnpm build`.

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- `/journal`-Übersicht und `/journal/[slug]` existieren noch nicht (Sprint 6)
  — Links aus Journal-Teaser und `ProjectCard` zeigen bewusst bereits auf die
  künftigen Pfade.
- Sektions-Überschriften ohne eigenes SiteConfig-Feld (z.B. „Hochzeiten,
  Reisen, Sport, Commercial.“ auf `/arbeiten`, „Backstage“/„Meilensteine“ auf
  `/ueber`) sind bewusst statisch im jeweiligen Seiten-Code geblieben — keine
  Über-Konfigurierbarkeit für reine Innenraum-Überschriften.
- `RichText`-Rendering nutzt die Default-Konverter aus
  `@payloadcms/richtext-lexical/react` ohne eigene `jsxConverters` — Styling
  läuft über Vererbung der `type-*`-Klasse auf dem Wrapper-`div`, nicht über
  pro-Node-Konverter. Ausreichend für einfache Absätze (aktueller Funktionsumfang
  aller `richText`-Felder in Sprint 5); Sprint 6 kann bei Bedarf eigene
  Konverter für Journal-Blocks ergänzen.
- Kein manueller visueller Browser-Check (Screenshot) in dieser Session —
  wie bereits in Sprint 3/4 nur REST-/HTTP-basierte Verifikation.
- `WorksGrid`-Filter ist rein client-seitig (kein Query-Param in der URL) —
  ein direkter Link auf eine gefilterte Ansicht (z.B. `/arbeiten?kategorie=sport`)
  ist daher noch nicht teilbar. Bewusste Vereinfachung für Sprint 5; bei Bedarf
  später per `useSearchParams`/`router.replace` nachrüstbar, ohne dass sich
  die Datenebene ändert.

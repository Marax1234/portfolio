# Sprint-10-Übergabe — Politur, Statistik-Hook, Härtung

**Datum:** 2026-06-19
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- **`pnpm build` → `pnpm start`** (oder `pnpm db:up && pnpm seed && pnpm dev`):
  - **`/impressum`** und **`/datenschutz`**: statische Platzhalterseiten, kein
    Dead-Link mehr. Footer-Pflichtlinks zeigen auf echte Seiten.
  - **Falsche URL / `notFound()`**: gebrandete 404-Seite „Hier ist nichts." mit
    Weiterführung zu Arbeiten / Journal / Kontakt — keine Sackgasse.
  - **`/sitemap.xml`** und **`/robots.txt`**: werden statisch generiert. Sitemap
    enthält alle statischen Routen + dynamische Projekt- und Journal-Slugs aus
    Payload. robots.txt sperrt `/admin` und `/api/`.
  - **Admin (`/admin`) → Dashboard**: Statistik-Karten erscheinen oben im
    Dashboard. Da UMAMI_API_* lokal nicht gesetzt sind, zeigen die Karten den
    Deployment-Hinweis: „Statistik wird im Deployment scharf geschaltet (Umami)."
    — Akzeptanzkriterium erfüllt: Ansicht sichtbar, auch ohne aktiven Dienst.
  - **A11y — Tastatur-Navigation:**
    - Skip-Link erscheint beim ersten Tab-Druck (sichtbar: grün, auf Primary-
      Hintergrund), springt direkt zu `<main id="main">`.
    - Header-Logo, Desktop-Nav-Links, Mobile-Bottom-Bar-Links, Footer-Links
      und Footer-Sitemap-Links: alle mit `focus-visible:outline-primary`-Ring.
    - WorksGrid (`/arbeiten`): Arrow-Left/Right/Home/End navigiert die Filter-
      Tabs ohne Maus; Roving-Tabindex korrekt gesetzt.
  - **Social-Links (`href="#"`)**: im Footer gefiltert — Spalte zeigt statt
    toter Links einen neutralen Hinweis „Folg mir bald — Links folgen." bis
    echte URLs in `navigation.ts` gepflegt werden.
  - **Umami-Tracking-Script (Frontend)**: wird nur eingebunden, wenn
    `NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID` gesetzt sind.
    Lokal: vollständig inert.
- **`pnpm build`** erfolgreich. Neue Routen als `○ (Static)` gebaut:
  `/datenschutz`, `/impressum`, `/robots.txt`, `/sitemap.xml`.
- **`pnpm check`** grün (tsc + eslint, keine Fehler).
- **Hex-Audit**: beide Greps leer — §0.2 eingehalten.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| Rechtstext Impressum | `src/app/(frontend)/impressum/page.tsx` | Direkt vor Deployment (Code-Edit, kein CMS nötig) |
| Rechtstext Datenschutz | `src/app/(frontend)/datenschutz/page.tsx` | Direkt vor Deployment |
| OG-Bild `/public/og-default.jpg` | Textplatzhalter, kein echtes Bild | Deployment: reales JPG (1200×630), Kilian-Portrait oder Hero-Still |
| Social-Links `href="#"` | `src/lib/navigation.ts`, `SOCIAL_LINKS` | Manuell per Code, sobald echte Profile live sind |
| Umami-Tracking inert | `(frontend)/layout.tsx` — Script conditional | Deployment: `NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID` setzen |
| Statistik-Karten im Leerzustand | `src/components/admin/StatsDashboard.tsx` | Deployment: `UMAMI_API_URL`, `UMAMI_API_TOKEN`, `UMAMI_WEBSITE_ID` setzen |
| Datenschutz-Abschnitt 4 (weitere Details) | `/datenschutz/page.tsx §4` | Vor Deployment: Hosting-Anbieter, Kontaktformular-Datenschutz etc. ergänzen |

---

## 3. Schnittstellen / Verträge (Folge-Sprints / Deployment)

### Umami-Env-Vertrag

Fünf neue Keys in `.env.example` dokumentiert:

| Key | Kontext | Zweck |
|---|---|---|
| `NEXT_PUBLIC_UMAMI_SRC` | Frontend (public) | URL des Tracker-Scripts |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Frontend (public) | Website-ID für Tracking |
| `UMAMI_API_URL` | Server-only | Basis-URL der Umami-Instanz |
| `UMAMI_API_TOKEN` | Server-only | API-Token für Stats-Abruf |
| `UMAMI_WEBSITE_ID` | Server-only | Website-ID für API-Calls |

### `getUmamiDashboardData()` — `src/lib/umami.ts`

Async-Funktion, gibt `UmamiDashboardData` zurück:
```ts
{ available: boolean, stats: UmamiStats, sources: UmamiSource[], topPages: UmamiTopPage[] }
```
Keine Throws; `available: false` wenn Env fehlt oder API antwortet nicht.
Cache: 1 h via `fetch({ next: { revalidate: 3600 } })`.

### `StatsDashboard` — `src/components/admin/StatsDashboard.tsx`

Async-RSC, registriert in `admin.components.beforeDashboard` in
`payload.config.ts`. Importmap aktuell (`src/app/(payload)/admin/importMap.js`
enthält `"@/components/admin/StatsDashboard#default"`).

### `sitemap.ts` — `src/app/sitemap.ts`

Nutzt `getAllProjectSlugs` + `getAllJournalSlugs` aus `src/lib/payload.ts`
(bereits getaggte Caches `projects` / `journal`). Basis-URL aus
`NEXT_PUBLIC_SERVER_URL`. Fehlerfall (keine DB im Build) → nur statische Routen.

### Skip-Link + `<main id="main">`

Layout `(frontend)/layout.tsx`: erster Body-Kindknoten ist `<a href="#main"
className="skip-link">`. `<main>` hat `id="main"` und `tabIndex={-1}` +
`outline-none` (kein sichtbarer Fokus-Ring auf dem Container selbst).
`.skip-link`-Utility in `globals.css` definiert.

---

## 4. Verifikation durchgeführt

- **Context7 (§0.3):** Payload 3 (`beforeDashboard`, `generate:importmap`) und
  Umami (Tracker-Script `data-website-id`, Stats-API `/api/websites/:id/stats`,
  Metrics `/api/websites/:id/metrics`) via `/payloadcms/payload` + `/websites/umami_is`
  gezogen. Versionsstand: Payload 3.85.1 / Umami 2.x.
- **`pnpm check`** grün (tsc + eslint, kein Fehler).
- **`pnpm build`** erfolgreich, alle Routen gebaut.
- **Hex-Audit:** beide Greps leer — kein Hardcode in keiner neuen oder
  geänderten Datei.
- **Token-Abnahmetest (Zentralitäts-Test):** Alle neuen Seiten
  (`/impressum`, `/datenschutz`, `/not-found`, `/error`, `/loading`) und
  Komponenten (`StatsDashboard`, Skip-Link) verwenden ausschließlich
  Tailwind-Utilities aus `@theme inline` (`bg-primary`, `text-on-primary`,
  `text-on-surface-variant`, `focus-visible:outline-primary`, `rounded-md`,
  `bg-surface-container-high`, etc.) oder Payload-Admin-CSS-Vars
  (`var(--theme-elevation-50)`, `var(--theme-text)`). Eine Änderung
  in `--color-primary` in `globals.css` schlägt automatisch auf alle
  betroffenen Utilities durch — nav-Links, Buttons, Fokus-Ringe, Tab-Filter,
  Skip-Link-Hintergrund.
- **Kein visueller Browser-Check** — wie Sprint 3–9: REST/Build-basierte
  Verifikation (kein Headless-Chromium verfügbar).

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- **VideoLoop `prefers-reduced-motion`** (Autoplay-Stopp): vom Nutzer im
  Scope-Check bewusst **nicht** gewählt → bleibt für Deployment-Phase oder
  separaten Patch. Vorhandenes `motion-reduce:`-Verhalten (Transitions) ist
  unverändert; das Poster-Bild ist als Fallback vorhanden bis `canplay` feuert.
- **Echter Rechtstext:** Impressum und Datenschutz sind Platzhalter —
  muss vor dem Go-Live durch korrekten Rechtstext ersetzt werden.
- **OG-Bild:** `/public/og-default.jpg` ist ein Textplatzhalter — echtes
  1200×630-Bild vor Deployment einfügen.
- **Social-Links:** `SOCIAL_LINKS`-Einträge in `navigation.ts` sind weiterhin
  `href: "#"` — Footer filtert sie aktiv heraus. Echte URLs per Code-Edit.
- **Statistik-Dienst (Umami):** Container, Konfiguration, API-Key — alles
  Deployment. App-seitige Schnittstelle ist fertig und warte-bereit.
- **Kein Browser-Screenshot** — wie Sprint 3–9.

---

## 6. Geänderte / neue Dateien (Überblick)

**Neu:**
- `src/lib/umami.ts` — Umami-API-Helper
- `src/components/admin/StatsDashboard.tsx` — Admin-Dashboard-Karten
- `src/app/(frontend)/impressum/page.tsx` — Impressum (Platzhalter)
- `src/app/(frontend)/datenschutz/page.tsx` — Datenschutz (Platzhalter)
- `src/app/(frontend)/not-found.tsx` — gebrandete 404-Seite
- `src/app/(frontend)/error.tsx` — Error-Boundary
- `src/app/(frontend)/loading.tsx` — Lade-Skelett
- `src/app/sitemap.ts` — XML-Sitemap
- `src/app/robots.ts` — robots.txt
- `public/og-default.jpg` — OG-Bild-Platzhalter

**Geändert:**
- `src/payload.config.ts` — `admin.components.beforeDashboard`
- `src/app/(payload)/admin/importMap.js` — auto-regeneriert (StatsDashboard)
- `src/app/(frontend)/layout.tsx` — Skip-Link, `main#main`, Umami-Script, erweiterte Metadata
- `src/app/globals.css` — `.sr-only` + `.skip-link`-Utilities
- `src/components/layout/SiteHeader.tsx` — `focus-visible:outline-primary` auf Logo + Links
- `src/components/layout/MobileBottomBar.tsx` — `focus-visible:outline-primary` auf Links
- `src/components/layout/SiteFooter.tsx` — `focus-visible` auf alle Links + `href="#"`-Filter Social
- `src/components/arbeiten/WorksGrid.tsx` — Roving-Tabindex + Keyboard-Nav
- `.env.example` — 5 Umami-Keys dokumentiert

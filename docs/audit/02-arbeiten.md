# Phase 1 — Diagnostik · `/arbeiten`

**Route:** `src/app/(frontend)/arbeiten/page.tsx`
**Beteiligte Komponenten:** `WorksGrid` (Filter-Tabs, Client), `ProjectCard`
**Aufbau:** Eyebrow → H1 → Filter-Tablist → 3-Spalten-Karten-Grid

> Richtung: hell + indie, **härtere Kanten.** Eine Portfolio-Übersicht lebt von
> der Bildwirkung — die Karten-Hülle sollte zurücktreten und *scharf* rahmen,
> nicht weich umschmeicheln. Systemische Befunde: `00-overview.md`.

| Kategorie | Befund | Severity | Quick Fix? |
|---|---|---|---|
| **Typografie** | H1 `display-lg` (Newsreader 300) + Eyebrow `label-caps` — klar. Filter-Tabs in `label-caps` (Inter, uppercase) — gut lesbar, passt zum funktionalen Layer. | — | — |
| **Typografie** | Karten-Titel `type-body-lg` (Newsreader 400), Meta `label-caps` — saubere Mini-Hierarchie pro Karte. | — | — |
| **Layout & Hierarchy** | Sauberes responsives Grid (1/2/3 Spalten, `gap-6`). Funktional einwandfrei. | — | — |
| **Layout & Hierarchy** | Filterleiste sitzt direkt unter H1 mit `mb-8` — klar. Keine Ergebniszahl/„X Projekte“ als Orientierung. | L | Ja |
| **Farbe & Surfaces** | **ProjectCard = Summe aller Weichmacher:** `rounded-xl` + `border-outline-variant` (fast unsichtbar) + `--shadow-ambient` (diffus) (S1+S3+S11). In einem Bild-Grid wirkt das schwammig statt galerie-scharf. **Primärer Härte-Hebel dieser Seite.** | **H** | Ja* |
| **Farbe & Surfaces** | Aktiver Filter-Tab: `bg-primary text-on-primary` (solide Sage) vs. inaktiv `border-outline-variant` — der aktive State ist schön hart, die inaktiven Borders sind zu blass (S11). | M | Ja |
| **Farbe & Surfaces** | Karten-Hintergrund `surface-container-lowest` (#fff) auf Creme — minimaler Kontrast, Karte „schwebt“ kaum sichtbar. Härter: definierte Border statt Schatten. | M | Ja* |
| **Spacing & Density** | `section-gap-y` (120px oben/unten) um den ganzen Block — viel Luft vor dem ersten Bild. Tab-zu-Grid-Abstand ok. | L | Ja* |
| **Interactive States** | Karte-Hover: `scale-105` + `border-outline` + Titel→`primary` (S8). Drei leise Signale, kein hartes. Filter-Tabs: nur `border`-Wechsel beim Hover. | M | Teilw. |
| **Interactive States** | **Tablist-A11y vorbildlich:** `role="tablist"`, Roving-Tabindex, Arrow/Home/End-Navigation, korrekte `aria-selected`. Positiv-Befund. | — | — |
| **Interactive States** | Leerzustand pro Kategorie sauber abgefangen („Noch keine Projekte …“). | — | — |
| **Motion** | Nur Cover-Zoom, `motion-reduce`-sicher. Tab-Wechsel ohne Transition (hart-instant) — passt sogar zur Richtung. | L | — |

\* siehe Overview — über `ProjectCard` + Token zentral lösbar.

### Seiten-Fazit
Funktional und A11y-seitig die sauberste Seite. Visuell zieht sie ihre Härte
**ausschließlich aus dem aktiven Tab** — Karten dagegen sind maximal weich.
Größter Hebel: **ProjectCard entweichen** (Radius runter, Ambient-Shadow raus,
definierte Border rein). Damit wirkt das ganze Grid sofort galerie-präziser.
Bonus: kleine Ergebniszahl an der Filterleiste.

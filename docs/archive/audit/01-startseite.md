# Phase 1 — Diagnostik · `/` Startseite

**Route:** `src/app/(frontend)/page.tsx`
**Module (Scroll-Reihenfolge):** Hero → Intro → Was ich mache → Featured →
Fakten-Strip → Aus dem Journal → Split-CTA → Footer
**Beteiligte Komponenten:** `HeroSection`, `IntroSection`, `WhatIDoSection`,
`FeaturedSection`, `FactsStrip`, `JournalTeaserSection` (→ `ProjectCard`),
`SplitCTA`

> Richtung: hell + indie bleibt, aber **härtere Kanten.** Die Startseite ist die
> wichtigste Bühne — hier zahlt jede Schärfung am meisten ein. Systemische
> Befunde siehe `00-overview.md` (S1–S11); hier nur seitenspezifisch.

| Kategorie | Befund | Severity | Quick Fix? |
|---|---|---|---|
| **Typografie** | Hero-H1 in Newsreader **300** auf Vollbild — elegant, aber dünn/weich. Auf bewegtem Bild leidet zudem die Lesbarkeit trotz Scrim. | M | Ja* |
| **Typografie** | Gute Hierarchie: `type-label-caps` (Eyebrow) → `display-lg` (H1) → `body-lg` (Tagline). Klar, kein Mangel. Skala ist eher „weich“ als zu laut. | — | — |
| **Typografie** | Tagline `max-w-md` direkt unter `display-lg` H1 — sauber. | — | — |
| **Layout & Hierarchy** | Hero ist `min-h-screen` Vollbild, Text unten (`items-end`). Stark. Aber alle Folge-Sektionen sitzen im selben `container-page` mit identischem `section-gap` (120px) → der Rhythmus wird ab Sektion 2 monoton. | M | Ja* |
| **Layout & Hierarchy** | `IntroSection` als 2/5-zu-3/5-Split (asymmetrisch) — gut, trägt den Indie/Editorial-Charakter. | — | — |
| **Layout & Hierarchy** | Sieben gleichgewichtete Sektionen ohne visuelle „Brüche“ (keine Trennlinien, kein Wechsel der Hintergrundfläche außer Footer). Härtere Optik bräuchte gezielte Kanten/Flächenwechsel zwischen Modulen. | M | Ja* |
| **Farbe & Surfaces** | Hero: `bg-mist-blue/15`-Tint + `from-inverse-surface/60`-Verlaufs-Scrim → pastellig/weich (S4). Härter: Tint reduzieren, Scrim als definierter/härterer Verlauf oder solider Balken. | M | Ja |
| **Farbe & Surfaces** | Featured & WhatIDo-Tiles: `rounded-xl` + Verlaufs-Scrim (S1, S4). FactsStrip: `rounded-xl` bricht die ansonsten kantige `gap-px`-Rasterlinie. | **H** | Ja* |
| **Farbe & Surfaces** | Gesamte Seite spielt nur auf `surface`/`surface-container-lowest` — sehr flach/hell. Ein bewusster dunkler oder kräftig-grüner Block (z. B. hinter Fakten oder CTA) gäbe „Härte“ und Rhythmus. | M | Nein |
| **Spacing & Density** | Durchgängig 120px `section-gap` → sehr luftig, niedrige Informationsdichte. Bewusst (Konzept „Breathable“), aber gegenläufig zu „kantiger/dichter“. Abwägung nötig. | M | Ja* |
| **Spacing & Density** | Innen-Padding der Module uneinheitlich (Featured `p-6 md:p-12`, SplitCTA `px-8 py-12 md:px-12 md:py-16`) — minimaler Konsistenz-Hinweis, kein Härte-Thema. | L | Ja |
| **Interactive States** | WhatIDo-Tiles & Journal-Cards: Hover nur `scale-105` + Color (S8). Leise. Für mehr Taktilität: sichtbare Border-/Kanten-Reaktion statt nur Zoom. | M | Teilw. |
| **Interactive States** | Featured-CTA = `Button primary` (solide Sage) — klarster, „härtester“ State der Seite. Positiv. | — | — |
| **Motion** | Nur Cover-Zoom (500ms) + Header-Shrink; `motion-reduce`-sicher (S10). Solide. Hero-Video-Loop (sofern gesetzt) ist die einzige „lebende“ Fläche. | L | — |
| **Motion** | `scrollHint` („↓ Scrollen“) ist statisch — eine dezente Bewegung wäre hier der naheliegendste, charaktervolle Mikro-Moment. | L | Ja |

\* siehe Overview — zentral über Token/Shared-Komponente steuerbar.

### Seiten-Fazit
Stärkste Seite, klare Erzähl-Reihenfolge, gute Typo-Hierarchie. Weichmacher sind
**Radien (S1), Tints/Scrims (S4) und der gleichförmige 120px-Rhythmus (S7).**
Größter Effekt für „härter“: Radien runter + ein bewusster Flächen-/Kontrastbruch
(dunkler oder satt-grüner Block) im Scrollverlauf + FactsStrip-Kante schärfen.

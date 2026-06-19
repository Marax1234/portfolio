# Phase 1 — Diagnostik · Überblick & systemische Befunde

> **Design-Richtung (Auftrag):** Hell und mit leichtem Indie-Vibe bleiben — aber
> **härtere Kanten, weniger aufgeweicht.** Das „Tonal Serenity / Synesthetic
> Light“-System ist heute bewusst weich gebaut (große Radien, Glas-Blur, weiche
> Ambient-Schatten, Pastell-Tints, Verlaufs-Scrims). Genau diese Weichmacher sind
> die zentralen Stellhebel.
>
> Dieser Bericht entstand **rein diagnostisch** (Phase 1, kein Code). Ein Teil
> der systemischen Hebel wurde inzwischen umgesetzt — siehe Status unten.

## Umsetzungsstatus (nach Phase 1)

| Befund | Status |
|---|---|
| **S1 — Radien** | ✅ Umgesetzt: `--radius-xl` 24→12px, `lg` 16→10px, `md` 12→8px (zentral in `globals.css`, gespiegelt in `design.md`). |
| **S2 — Glassmorphismus** | ✅ Umgesetzt: `SiteHeader`, `MobileBottomBar`, `GlassCard` auf solide Flächen, kein Blur. (Demo-Seiten `styleguide`/`komponenten` bewusst unverändert.) |
| **S3 — Ambient-Shadow** | ✅ Umgesetzt: auf `ProjectCard` entfernt; Token bleibt definiert, aber ungenutzt. |
| **S11 — blasse Borders** | ✅ Teilweise: `--border-tonal` + `ProjectCard`/Chrome auf `outline` (definiert). FactsStrip-Divider/Info-Boxen bewusst weiter `outline-variant`. |
| **S4 — Mist-Blue-Tints** | ✅ Umgesetzt: Pastell-Tint aus `HeroSection` + `VideoLoop` entfernt (Bild/Video voll kontrastreich). Funktionale Verlaufs-Scrims für Textlesbarkeit bewusst behalten. |
| **S5 — Display-Schriftschnitt** | ✅ Umgesetzt: `.type-display-lg` 300→400, `.type-headline-md` 400→500 (mehr Gewicht/Struktur). |
| **S6 — Sekundärtext-Kontrast** | ✅ Umgesetzt: `--color-on-surface-variant` #434842 → #3a3f39 (1 Tick präsenter, Hierarchie bleibt). |
| **S7 — section-gap-Rhythmus** | ✅ Teilweise: `--section-gap` 120→96px (dichter). Trennlinien/ungleichmäßige Sprünge = per-Seite-Entscheidung, bewusst deferred. |
| **Bug — Media-Kit-Button** | ✅ Behoben: nutzt `buttonClasses("secondary")` statt Hardcode-Duplikat. |
| S8, S10 (Hover, Motion) | ⏳ Offen — bewusst nicht angefasst (Scope-Disziplin). |

---

## Lesehilfe zu den Seiten-Berichten

Pro Hauptseite existiert ein eigener Bericht mit der vorgegebenen Audit-Tabelle:

| Datei | Seite |
|---|---|
| `01-startseite.md` | `/` Startseite |
| `02-arbeiten.md` | `/arbeiten` |
| `03-journal.md` | `/journal` |
| `04-ueber.md` | `/ueber` |
| `05-kontakt.md` | `/kontakt` |
| `06-kooperationen.md` | `/kooperationen` |

Die folgenden Befunde gelten **seitenübergreifend** (geteilte Komponenten /
Token-Schicht) und werden in den Einzelberichten nur referenziert, nicht
wiederholt.

---

## Systemische Befunde (gelten für ALLE Seiten)

| # | Kategorie | Befund | Severity | Quick Fix? |
|---|---|---|---|---|
| S1 | Farbe & Surfaces | **Durchgängig `rounded-xl` (1.5rem/24px)** auf praktisch jedem Container: Hero, Karten, Tiles, FactsStrip, SplitCTA, Bilder, Footer-CTAs. Das ist der größte „aufgeweicht“-Faktor des ganzen Auftritts. | **H** | Ja* |
| S2 | Farbe & Surfaces | **Glassmorphismus** (`--glass-bg` 80 % Weiß + 16px Blur) in Header, MobileBottomBar, GlassCard. Diffus, „weich“, kontrastarm gegen den cremefarbenen Hintergrund. | **H** | Ja |
| S3 | Farbe & Surfaces | **Ambient-Shadow** (`0 8px 40px -8px sage/10%`) auf ProjectCard — ultradiffus, kaum sichtbar, betont die Weichheit statt klarer Kante. | M | Ja |
| S4 | Farbe & Surfaces | **Mist-Blue-Tints & Verlaufs-Scrims** (`bg-mist-blue/15`, `from-inverse-surface/60`) über Bildern. Vereinheitlichen die Bildwelt ins Pastellige — gegenläufig zu „härter/kantiger“. | M | Ja |
| S5 | Typografie | **Nur ein sichtbarer Schriftschnitt im Display** (Newsreader **300**, sehr dünn) für alle H1. Dünn = weich. Härte entstünde durch mehr Gewicht-/Kontrast­spreizung (z. B. 300 für Fließ-Display, aber kräftigere H2/Labels). | M | Ja* |
| S6 | Typografie | `text-on-surface-variant` (#434842) für Sekundärtext ist relativ blass auf Creme — funktional ok, aber trägt zum „soft, low-contrast“-Gesamteindruck bei. | L | Ja* |
| S7 | Layout & Hierarchy | **`section-gap` = 120px global** auf jeder Seite zwischen allen Sektionen. Sehr luftig (= „breathable“, gewollt), erzeugt aber wenig Rhythmus-Varianz; alles atmet gleich. Härtere Kante = bewusstere, ungleichmäßigere Sprünge + sichtbare Trennlinien statt nur Leerraum. | M | Ja* |
| S8 | Interactive States | **Hover ist fast überall nur `transition-colors` oder `scale-105`.** Leise, weich, kaum taktil. Keine Border-/Offset-/Translate-Reaktion, die „Kante“ spürbar macht. | M | Teilw. |
| S9 | Interactive States | **Fokus-Ring konsistent vorhanden** (`focus-visible:outline-2 outline-primary`) — A11y-seitig gut, kein Mangel. Positiv-Befund. | — | — |
| S10 | Motion | **Sehr sparsam** (nur Cover-Scale + Header-Shrink), durchgehend `motion-reduce`-sicher. Solide Basis; für mehr „Charakter“ fehlen gezielte Mikro-Interaktionen (kein Übermaß nötig). | L | — |
| S11 | Layout & Hierarchy | **Kanten/Borders nutzen fast nur `outline-variant` (#c4c8c0)** — sehr hell, fast unsichtbar. Eine härtere Optik lebt von definierten Linien (dunkler `outline`, evtl. 1.5–2px, oder echtes Schwarz-auf-Creme als Akzent). | M | Ja |

\* „Ja*“ = über die Token-Schicht (`globals.css`) zentral steuerbar, wirkt aber
breit — bewusste Abnahme empfohlen, da viele Seiten gleichzeitig betroffen sind.

---

## Die drei großen Hebel für „härtere Kanten“

1. **Radius-Token kalibrieren** (`--radius-xl`, `--radius-lg`, `--radius-md` in
   `:root`). Da praktisch alle Container `rounded-xl` nutzen, verschiebt eine
   Reduktion von 24px → z. B. 6–10px den Gesamteindruck sofort von „weich/organisch“
   zu „editorial/kantig“ — eine Stelle, globale Wirkung. Alternativ semantische
   Radien einführen (Cards kantiger, Buttons separat).
2. **Glas → solide Flächen.** Header/BottomBar/Cards von `--glass-bg`+Blur auf
   deckende `surface-container`-Töne mit **definierter** 1px-Border umstellen.
   Erhöht Kontrast und Kanten-Schärfe; behält die helle Anmutung.
3. **Borders & Schatten schärfen.** `--shadow-ambient` zurücknehmen,
   `--border-tonal` von `outline-variant` auf den kräftigeren `outline` (oder
   1.5px) heben. Definierte Linie statt diffuser Wolke.

> Indie-Vibe bleibt erhalten: Creme-Hintergrund, Sage-Grün, Newsreader-Serif,
> asymmetrische Splits und der editoriale Ton sind **nicht** die Weichmacher —
> die bleiben. Hart wird es über Radius, Flächen und Linien, nicht über die Farb-
> oder Schriftwahl.

---

## Geteilte Komponenten — Kurz-Audit

| Komponente | Härte-relevanter Befund | Severity |
|---|---|---|
| `SiteHeader` | Glas-Blur im Scroll-Zustand (S2); ansonsten klar, gute aktive States. | M |
| `MobileBottomBar` | Glas-Blur (S2); Nano-Label 10px sehr klein; Icons dünn (1.5px stroke) → weich. | M |
| `SiteFooter` | Solide & klar (kein Glas) — am ehesten „härtere“ Referenz im Bestand. Nur `outline-variant`-Linien (S11). | L |
| `Button` | `rounded-md` (12px) noch relativ weich; Sekundär-Variante mit `mist-blue`-Border = blass/weich (S11). | M |
| `ProjectCard` | `rounded-xl` + Ambient-Shadow + nur Color-Hover = Summe aller Weichmacher (S1+S3+S8). | **H** |
| `SplitCTA` | `rounded-xl` + `primary-fixed/secondary-fixed` Pastellflächen; weich, aber farblich ok. | M |
| `FactsStrip` | `rounded-xl` mit `gap-px`-Rasterlinien — die Linien-Idee ist bereits „kantig“; Radius bricht den Effekt. | M |
| `GlassCard` | Per Definition der weichste Baustein (Blur). Prüfen, wo überhaupt eingesetzt. | M |
| `HeroSection` | Vollbild, Verlaufs-Scrim + Mist-Tint (S4); dünner Display-Text auf Bild. | M |

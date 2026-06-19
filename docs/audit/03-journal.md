# Phase 1 — Diagnostik · `/journal`

**Route:** `src/app/(frontend)/journal/page.tsx`
**Beteiligte Komponenten:** `JournalFeed`
**Aufbau:** Eyebrow → H1 → chronologischer Feed (Cover links, Text rechts, je
Eintrag ein 2/3-zu-3/5-Split)

> Richtung: hell + indie, **härtere Kanten.** Der Feed ist bewusst editorial
> (kein Grid). Genau dieser „Magazin“-Charakter verträgt mehr Härte: kräftigere
> Trennlinien, schärfere Bildrahmen. Systemische Befunde: `00-overview.md`.

| Kategorie | Befund | Severity | Quick Fix? |
|---|---|---|---|
| **Typografie** | H1 `display-lg`; pro Eintrag Meta `label-caps` (primary) → Titel `headline-md` (Newsreader 400) → Teaser `body-md`. Klar gestufte, editoriale Hierarchie. Gut. | — | — |
| **Typografie** | Teaser `line-clamp-2` — saubere, gleichmäßige Feed-Höhe. | — | — |
| **Typografie** | Meta in `primary` (Sage) als einziges Farbsignal pro Eintrag — dezent. Für mehr Editorial-Härte ginge eine deutlichere Datums-/Kategorie-Auszeichnung (z. B. Trennzeichen, Versalien-Tracking). | L | Ja |
| **Layout & Hierarchy** | Pro Eintrag `grid-cols-[2fr_3fr]` (Bild/Text), `sm:items-center` — ruhig, lesbar. Indie-Magazin-Feel sitzt. | — | — |
| **Layout & Hierarchy** | **Einträge nur durch `gap-12/16` getrennt — keine sichtbare Trennlinie.** Im Magazin-Kontext fehlt damit die „harte Kante“ zwischen Stories. Eine Regel-Linie (`border-t`) pro Eintrag wäre der naheliegendste Härte-Gewinn. | M | Ja |
| **Layout & Hierarchy** | Alle Cover gleich groß/gleiches 4:3 → sehr gleichförmiger Rhythmus. Ein bewusst variierender erster (großer) Eintrag gäbe Hierarchie. | M | Nein |
| **Farbe & Surfaces** | Cover `rounded-xl` (S1) auf Creme, ohne Border — der weiche Radius ist hier der einzige, aber deutliche Weichmacher. Härter: Radius runter / 0, ggf. dünne definierte Kante. | M | Ja* |
| **Farbe & Surfaces** | Kein Karten-Hintergrund, kein Schatten — schön flach/editorial. Im Sinne der Richtung eigentlich gut; nur der Bild-Radius bricht es. | L | Ja* |
| **Spacing & Density** | `section-gap-y` außen + `gap-12 sm:gap-16` zwischen Einträgen. Luftig, lesbar. Mit Trennlinien könnte der Abstand sogar etwas enger und damit „dichter/härter“ werden. | L | Ja |
| **Interactive States** | Ganzer Eintrag ist `group`-Link: Hover = Cover `scale-105` + Titel→`primary` (S8). Leise, konsistent mit Rest. Kein hartes Signal. | M | Teilw. |
| **Interactive States** | Leerzustand sauber („Noch keine Beiträge.“). Fokus-Ring vorhanden (über Link). | — | — |
| **Motion** | Nur Cover-Zoom, `motion-reduce`-sicher (S10). Angemessen ruhig. | L | — |

\* siehe Overview — über Radius-Token zentral.

### Seiten-Fazit
Inhaltlich/typografisch die „indie-editorialste“ Seite und nah an der
Zielrichtung. Sie ist heute **zu weichkantig durch Bild-Radius (S1) und das
Fehlen von Trennlinien.** Härte-Hebel hier sind kleinteilig und risikoarm:
Regel-Linien zwischen Einträgen, Cover-Radius reduzieren, optional einen großen
Leit-Eintrag oben. Kein Glas, keine Schatten — gute Ausgangslage.

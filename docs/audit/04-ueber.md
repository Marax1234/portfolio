# Phase 1 — Diagnostik · `/ueber`

**Route:** `src/app/(frontend)/ueber/page.tsx`
**Aufbau:** Eyebrow → H1 → großes 4:3-Hero-Bild → Story (RichText) →
Meilenstein-Timeline → „Was mich ausmacht“ (Grid) → Backstage-Grid → Split-CTA
**Beteiligte Komponenten:** `Media`, `RichText`, `SplitCTA`

> Richtung: hell + indie, **härtere Kanten.** „Über mich“ darf am persönlichsten
> und damit am charaktervollsten sein — Timeline und Backstage sind die Stellen,
> an denen definierte Kanten Struktur (statt Weichheit) geben. Systemische
> Befunde: `00-overview.md`.

| Kategorie | Befund | Severity | Quick Fix? |
|---|---|---|---|
| **Typografie** | H1 `display-lg`; Story als `RichText` in `type-body-lg` + `max-w-prose` — gute Lesezeile, persönlicher Editorial-Ton. H2-Sektionen in `headline-md`. Stimmig. | — | — |
| **Typografie** | Timeline: Jahr in `label-caps` (primary), Titel `body-md`, Beschreibung `body-md` (variant). Jahr und Beschreibung beide klein — die Jahreszahl als Anker dürfte für „Härte“ deutlich kräftiger/größer sein. | M | Ja |
| **Layout & Hierarchy** | Klare vertikale Erzählung, kein Sackgassen-Ende (Split-CTA). Gut strukturiert. | — | — |
| **Layout & Hierarchy** | **Timeline:** `border-l border-outline-variant pl-6` — die linke Linie ist die einzige „Struktur-Kante“ der Seite, aber in `outline-variant` fast unsichtbar (S11) und ohne Punkte/Marker je Station. Hier liegt das größte ungenutzte Härte-Potenzial. | M | Ja |
| **Layout & Hierarchy** | „Was mich ausmacht“ als 2-Spalten-Karten mit `rounded-xl border-outline-variant p-6` — weiche, blasse Boxen (S1+S11). | M | Ja* |
| **Farbe & Surfaces** | Hero-Bild & Backstage-Kacheln durchgängig `rounded-xl` (S1). Backstage als 2/3-Spalten-Grid (`gap-4`) wirkt durch die runden Ecken eher „Sammelalbum-weich“ als „Kontaktbogen-hart“. Ein knapperer Radius + engeres Raster gäbe Reportage-Härte. | M | Ja* |
| **Farbe & Surfaces** | Sehr flach: alles auf `surface`, einzige Flächen sind die blassen Karten. Kein Kontrastanker auf der ganzen Seite. | M | Nein |
| **Spacing & Density** | Jede Sektion via `section-gap` (120px) — sehr luftig. Bei viel kurzteiligem Inhalt (Timeline, Stichworte, Kacheln) entsteht dadurch viel Leerraum zwischen kleinen Einheiten. Dichter wäre charaktervoller. | M | Ja* |
| **Spacing & Density** | Story `max-w-prose` ohne Spaltenführung — solide Lesetypografie. | — | — |
| **Interactive States** | Backstage-Kacheln & Hero sind **nicht** verlinkt → keine Hover-States (statisch). „Was mich ausmacht“-Karten ebenfalls statisch. Wenig taktil, aber inhaltlich vertretbar. | L | — |
| **Interactive States** | Einzige interaktiven Elemente: Split-CTA-Buttons (klar) + Inline-Links im RichText. Fokus-Ringe über Shared-Komponenten vorhanden. | — | — |
| **Motion** | Keine seiteneigene Motion (statische Bilder). Ruhig. `motion-reduce` global respektiert. | L | — |

\* siehe Overview — über Radius/Border-Token + Shared-Komponente.

### Seiten-Fazit
Erzählerisch stark, aber visuell die **flachste/weichste** Hauptseite: blasse
Boxen, kaum sichtbare Timeline-Linie, viel Leerraum zwischen kleinteiligem
Inhalt. Größte Härte-Hebel: **Timeline schärfen** (kräftige Linie + Marker +
größere Jahreszahl), Backstage als engeres/kantigeres Raster, „Was mich
ausmacht“-Boxen mit definierter Kante statt blasser `outline-variant`.

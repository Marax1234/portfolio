# Phase 1 — Diagnostik · `/kooperationen`

**Route:** `src/app/(frontend)/kooperationen/page.tsx`
**Beteiligte Komponenten:** `Media`, `Button`, `FactsStrip`, `SplitCTA`
**Aufbau:** Eyebrow → H1 → Einleitung → „Was ich biete“ / „Für wen“ (2 Spalten)
→ Reichweite (FactsStrip) → Bisherige Kooperationen (Logo-Karten) →
Media-Kit-/Anfrage-CTA → Split-CTA

> Richtung: hell + indie, **härtere Kanten.** Diese Seite spricht Marken/Sponsoren
> sachlich an — sie verträgt (und braucht) den meisten „harten“, fast
> B2B-präzisen Charakter. Systemische Befunde: `00-overview.md`.

| Kategorie | Befund | Severity | Quick Fix? |
|---|---|---|---|
| **Typografie** | H1 `display-lg` „Zusammenarbeit.“; Einleitung `body-lg`. Listen „Was ich biete/Für wen“ als `body-md` mit `—`-Prefix (primary) — schöner editorialer Listen-Stil, passt zur Richtung. | — | — |
| **Typografie** | Klare H2-Sektionen (`headline-md`). Konsistent mit Rest. | — | — |
| **Layout & Hierarchy** | Logische Top-Down-Argumentation (Angebot → Reichweite → Referenzen → CTA). Gut für eine Pitch-Seite. | — | — |
| **Layout & Hierarchy** | Viele Sektionen sind **conditional** (nur bei Daten). Solange Reichweite/Referenzen leer sind, kann die Seite dünn/lückig wirken — Platzhalter-Strategie für den Leerfall prüfen. | M | Nein |
| **Layout & Hierarchy** | 2-Spalten-Block „Was ich biete / Für wen“ (`md:grid-cols-2 gap-12`) ohne Trennlinie zwischen den Spalten — eine vertikale Regel gäbe hier B2B-Struktur/Härte. | L | Ja |
| **Farbe & Surfaces** | **Referenz-Karten:** `rounded-xl border-outline-variant p-6` (S1+S11) — weich + blasse Kante. Logos in `w-24 h-12 rounded` Box. Für „härter“: definierte Kante, knapperer Radius, ggf. Logo-Raster mit echten Zellenlinien (wie FactsStrip-Idee). | M | Ja* |
| **Farbe & Surfaces** | **Media-Kit-Button: Hardcoded Klassen-Duplikat** des Sekundär-Buttons (`border border-mist-blue …`) direkt inline statt `<Button variant="secondary">` — blasse `mist-blue`-Kante (S11) **und** Wartungs-/Konsistenzrisiko (zwei Quellen für denselben Stil). | M | Ja |
| **Farbe & Surfaces** | FactsStrip (`rounded-xl` + `gap-px`-Rasterlinien) — die Rasterlinien sind bereits „kantig“, der Außenradius bricht es (S1). | M | Ja* |
| **Spacing & Density** | Durchgängig `section-gap` (120px). Auf einer argumentativen Pitch-Seite wirkt das eher zu luftig — dichtere Blöcke würden „professionell/zupackend“ wirken. | M | Ja* |
| **Interactive States** | Referenz-Karten statisch (nicht verlinkt) — vertretbar. Media-Kit-`<a download>` + `Button primary` „Kooperation anfragen“ (solide Sage) = klarste Aktion. Fokus-Ring auf Media-Kit-Link vorhanden. | — | — |
| **Interactive States** | Sekundär-/Media-Kit-Hover nur `hover:bg-surface-container` — sehr leise (S8). | L | Teilw. |
| **Motion** | Keine seiteneigene Motion. Statisch, sachlich — passt. | L | — |

\* siehe Overview — Token/Shared.

### Seiten-Fazit
Inhaltlich klar strukturierte Pitch-Seite, die am stärksten von „härter“ profitiert
(B2B-Präzision). Konkrete Hebel: **Referenz-Karten schärfen** (Kante statt blasser
`outline-variant`, knapperer Radius), **Media-Kit-Button auf `<Button>`-Komponente
zurückführen** (Hardcode-Duplikat entfernen, S11), Spalten-/FactsStrip-Linien als
bewusste Kanten nutzen, Spacing verdichten. Leerfall-Strategie für conditional
Sektionen prüfen.

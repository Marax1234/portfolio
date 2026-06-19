# Phase 1 — Diagnostik · `/kontakt`

**Route:** `src/app/(frontend)/kontakt/page.tsx`
**Beteiligte Komponenten:** `ContactForm` (Client + Server Action), `SplitCTA`,
`SOCIAL_LINKS`
**Aufbau:** Eyebrow → H1 → Subline → Formular → Direkt-Kontaktzeile (Mail +
Socials + Antwort-Erwartung) → Split-CTA

> Richtung: hell + indie, **härtere Kanten.** Bewusst reduziert („je weniger
> Reibung, desto mehr Anfragen“). Hier heißt „härter“ vor allem: klar definierte
> Formularfelder statt weicher Editorial-Linien. Systemische Befunde:
> `00-overview.md`.
>
> ⚠️ **Hinweis:** `ContactForm.tsx` wurde in Phase 1 noch nicht im Detail
> geöffnet — die Formular-Befunde unten stützen sich auf die Einbindung in
> `page.tsx` und die `design.md`-Vorgaben (Input-Stil „Bottom-Border ODER
> gerundeter Sage-5 %-Fill“). **In Phase 2 vor Umsetzung verifizieren.**

| Kategorie | Befund | Severity | Quick Fix? |
|---|---|---|---|
| **Typografie** | H1 `display-lg` „Lass uns reden.“ + Subline `body-lg` (variant) — freundlich, klar. Direkt-Zeile nutzt `label-caps` + `body-lg` (Mail in primary). Gute Mini-Hierarchie. | — | — |
| **Typografie** | „oder direkt“ als `label-caps` (variant) als Trenn-Label — funktioniert; könnte als echte Trennlinie + Label mehr Struktur/Kante geben. | L | Ja |
| **Layout & Hierarchy** | Einspaltiger, vertikaler Lesefluss — angemessen reduziert. Kein Sackgassen-Ende (Split-CTA). | — | — |
| **Layout & Hierarchy** | Formular ohne sichtbaren Container/Rahmen direkt im Textfluss — minimalistisch. Härtere Optik könnte das Formular als klar abgegrenzten Block (definierte Kante/Fläche) inszenieren. | M | Ja* |
| **Farbe & Surfaces** | **Input-Stil zu prüfen (S-Verifikation):** `design.md` erlaubt „Bottom-Border-only“ **oder** „gerundeter Sage-5 %-Fill“. Für die Richtung „härter“ ist Bottom-Border-only (editorial, kantig) klar zu bevorzugen gegenüber dem weichen gefüllten Pill-Look. | M | Ja |
| **Farbe & Surfaces** | Media-Kit-/Sekundär-Buttons im Projekt nutzen `border-mist-blue` (blass, weich, S11) — falls das Kontaktformular denselben Stil erbt, hier ebenfalls schärfen. | M | Ja |
| **Farbe & Surfaces** | Sehr flach (nur `surface`). Für eine Conversion-Seite ok; ein klarer Fokus-Rahmen ums Formular gäbe ihr mehr „Gewicht“. | L | Ja* |
| **Spacing & Density** | `section-gap` (120px) zwischen Formular, Direkt-Zeile und Split-CTA — auf einer bewusst kurzen Seite wirkt das sehr auseinandergezogen. Hier wäre dichteres Spacing passender. | M | Ja* |
| **Interactive States** | Mail-Link: `hover:underline underline-offset-4` — taktiles, eher hartes Signal (gut). Social-Links: `hover` Farbe→`on-surface`. | — | — |
| **Interactive States** | **Formular-States (Fehler/Erfolg/Disabled/Loading) nicht auditiert** — `ContactForm.tsx` in Phase 2 öffnen. `--color-error` ist tokenseitig vorhanden; Umsetzung prüfen (Fehlerfarbe, Pflichtfeld-Markierung, Submit-Disabled). | M | — |
| **Motion** | Keine seiteneigene Motion sichtbar. Formular-Feedback (Submit→Erfolg) ist der relevante Motion-Moment — in Phase 2 prüfen. | L | — |

\* siehe Overview — Token/Shared.

### Seiten-Fazit
Reduziert und zielgerichtet — die Richtung „weniger Reibung“ ist korrekt. Für
„härter“ zählt hier vor allem **der Input-Stil** (Bottom-Border-only statt
weicher Pill) und **dichteres Spacing** auf der kurzen Seite. **Offen:
`ContactForm.tsx` muss in Phase 2 für Feld-Styling und Fehler-/Erfolgs-States
geöffnet werden** — diese Datei wurde in Phase 1 nicht gelesen.

# Sprint-3-Übergabe — Statische Startseite

**Datum:** 2026-06-17
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- `pnpm dev` → `http://localhost:3000` zeigt die **komplette Startseite** mit
  allen Modulen aus Konzept §4.1: Hero (Vollbild) → Intro „Ich in einem
  Absatz" → „Was ich mache" (3 Kacheln) → Featured-Projekt → Fakten-Strip →
  „Aus dem Journal" (3 Karten) → geteilter CTA → globaler Footer.
- Alle Texte sind Platzhalter im Tone of Voice (§7): trocken, konkret, erste
  Person.
- `/komponenten` und `/styleguide` unverändert weiterhin verfügbar.

**Mobile-First testen:** DevTools ~375px → Hero füllt Viewport, Module
stapeln sich, Bottom-Bar verdeckt nichts. Desktop: asymmetrischer
Intro-Split (Portrait 2/5, Text 3/5), 3-Kachel-Grid, großflächiges Featured,
SplitCTA 50/50.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| Hero-Video-Loop | `HeroSection.tsx` → `data-video-slot="hero"` (zeigt aktuell `<Media id="hero-poster">` als Poster) | **Sprint 8** |
| Alle Bild-Slots (`hero-poster`, `portrait`, `tile-*`, `featured`, `journal-*`) | `src/lib/media/local-provider.ts` → `MANIFEST` (zeigen alle auf `placeholder.svg`) | Sprint 5 (Inhalte) / Sprint 7 (Object Storage) |
| Alle Fließtexte (Intro, Featured, Journal-Teaser, Tile-Labels) | `src/components/home/*.tsx` | **Sprint 5** (Payload-Daten) |
| Kachel-Hover-Video-Snippets (Konzept §4.1) | noch nicht implementiert — aktuell nur Bild-Zoom | **Sprint 8** |
| Ziel-Links (`/arbeiten`, `/journal/...`) | weiterhin 404 (siehe Sprint-2-Handover) | Sprint 5 / 6 |

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### Neue Section-Komponenten — `src/components/home/`
```typescript
HeroSection: () => JSX.Element                       // kein Props — fixer Hero
IntroSection: { className?: string }
WhatIDoSection: { className?: string }
FeaturedSection: { className?: string }
JournalTeaserSection: { className?: string }
```
Alle RSC, komponieren ausschließlich Sprint-2-Bausteine (`Button`,
`ProjectCard`) und `<Media>`. Sprint 5 ersetzt die intern hartkodierten
Platzhaltertexte/-Arrays durch Payload-Queries — die Komponenten-Signaturen
(Props) bleiben unverändert.

### Neue Medien-Slot-IDs — `src/lib/media/index.ts` (unverändert) / `local-provider.ts`
```
hero-poster · portrait · tile-menschen · tile-reisen · tile-sport ·
featured · journal-1 · journal-2 · journal-3
```
Sprint 7 tauscht in `src/lib/media/index.ts` nur `localProvider` gegen
`objectStorageProvider` — diese IDs bleiben als Schlüssel bestehen.

### `src/app/page.tsx`
Struktur: `<HeroSection />` (full-bleed, außerhalb `container-page`) +
`<div className="container-page">` mit den restlichen Sections in
Konzept-Reihenfolge, `section-gap` zwischen jedem Modul.

---

## 4. Verifikation durchgeführt

- **Token-Audit:** `grep` auf Hex-Werte in `style={}`/`className` über `src/` —
  leer, kein Treffer.
- **Qualität:** `pnpm check` (`tsc --noEmit` + `eslint src/`) — beide grün.
- **Laufzeit:** Homepage liefert HTTP 200, keine Server-Fehler/Warnungen im
  Next.js-Dev-Log. Alle Modul-Marker (Texte, `data-video-slot`) im
  gerenderten HTML bestätigt.
- **Browser-Screenshot-Verifikation:** nicht durchgeführt (Chromium-Headless
  in dieser Umgebung nicht erreichbar/gewünscht) — Verifikation stattdessen
  über HTML-Inhaltsprüfung und Server-Logs.

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- Kachel-Hover-Video-Snippets (Konzept §4.1) — erst Sprint 8 (HLS).
- Alle Inhalte/Bilder sind Platzhalter — Sprint 5 ersetzt sie durch Payload.
- Ziel-Routen der Links (`/arbeiten`, `/journal/...`) bleiben bis zu ihrem
  jeweiligen Sprint 404.
- Kein manueller visueller Browser-Check (Screenshot) in dieser Session —
  nur HTML-/Log-basierte Verifikation.

---

## 6. Verzeichnisstruktur (neu in Sprint 3)

```
src/
  app/
    page.tsx                    ← Startseite, komponiert alle Module
  components/
    home/
      HeroSection.tsx            ← Vollbild-Hero + Video-Loop-Slot (Sprint 8)
      IntroSection.tsx            ← „Ich in einem Absatz"
      WhatIDoSection.tsx          ← 3 Kacheln
      FeaturedSection.tsx         ← Featured-Projekt
      JournalTeaserSection.tsx    ← Journal-Teaser-Karten
  lib/
    media/
      local-provider.ts          ← + 9 neue benannte Slot-IDs im MANIFEST
```

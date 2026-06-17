# Portfolio Kilian Siebert — Entwicklungsregeln

## Skills
- Nutze den `frontend-design` Skill für alle UI-Entscheidungen

## Pflichtlektüre vor jeder UI-Arbeit

Vor jeder neuen UI-Arbeit folgende Dateien einlesen:
- `design.md` — verbindliche Quelle für alle visuellen Werte
- `portfolio-konzept-kilian-siebert.md` — Seitenstruktur, UX, Tone of Voice
- `tech-stack-konfiguration.md` — Architektur-Entscheidungen

Bei Konflikten gilt: Architektur aus Tech-Stack, Optik aus Design, Inhalt/UX aus Konzept.

## Harte Token-Regel (§0.2 Sprintplan — Abnahme-Blocker)

**Kein Hardcode.** Kein Hex-Wert, keine px-Schriftgröße, kein Radius direkt in einer Komponente.

✅ Erlaubt:
- Tailwind-Utilities aus `@theme inline`: `bg-primary`, `text-on-surface`, `rounded-xl`
- CSS-Variablen: `style={{ color: 'var(--color-primary)' }}`

❌ Verboten (gilt als Fehler in jeder Sprint-Abnahme):
- `style={{ color: '#516051' }}`
- `className="text-[#849483]"`
- `style={{ borderRadius: '1.5rem' }}`
- `className="text-[64px]"`

**Erlaubte Ausnahmen:**
- `src/app/globals.css` — dort stehen die kanonischen Werte
- In Daten-Arrays als **beschriftende Labels** (z.B. `hex: "#516051"` in einem Array, das Token-Dokumentation anzeigt) — die eigentliche Stilzuweisung muss trotzdem über `var(--…)` erfolgen

### Abnahme-Audit

```bash
# Findet Hex-Werte in style={} und className — muss leer sein:
grep -rn 'style={{[^}]*"#[0-9a-fA-F]' src/ --include="*.tsx"
grep -rn 'className="[^"]*\[#[0-9a-fA-F]' src/ --include="*.tsx"
```

## Medien-Abstraktion (§0.5 Sprintplan)

Bilder **immer** über `<Media id="..." />` aus `@/components/Media` einbinden.
Nie direkte Pfade (`/public/...`) oder URLs in Komponenten schreiben.

Sprint 7 tauscht den Provider aus — Aufrufer bleiben unverändert.

## Design-Token-Hierarchie

```
:root in globals.css          ← kanonische Werte (einzige Stelle)
   ↓
@theme inline in globals.css  ← Tailwind-Utilities referenzieren :root-Vars
   ↓
Komponenten / Seiten          ← nur Utilities oder var(--…)
```

## Stack

- Next.js 16.x (App Router, RSC) + TypeScript
- Tailwind v4 (CSS-first, kein tailwind.config.js)
- pnpm als Paketmanager
- Design-System „Tonal Serenity / Synesthetic Light"

## Qualitäts-Check nach jedem Sprint

Am Ende jedes Sprints, vor der Übergabe, einmal ausführen:

```bash
pnpm check
```

Das läuft `tsc --noEmit` (Typsicherheit) und `eslint src/` (Code-Qualität) nacheinander durch. Erwartet: beide ohne Fehler. Sprint gilt erst als abgenommen, wenn `check` grün ist.

## Context7 (§0.3)

Bei Unsicherheit über eine API oder neue Tool-Integration:
```bash
npx ctx7@latest library "<Name>" "<Frage>"
npx ctx7@latest docs <libraryId> "<Frage>"
```
Pflicht-Trigger: Next.js 16, Payload 3, HLS-Player, S3/Object-Storage, FFmpeg.

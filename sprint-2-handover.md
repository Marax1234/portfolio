# Sprint-2-Übergabe — Globale Bausteine & Navigation

**Datum:** 2026-06-17  
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- `pnpm dev` → App startet auf `http://localhost:3000`
- `/komponenten` — Interne Galerie: alle Sprint-2-Bausteine (Buttons, GlassCard, ProjectCard, FactsStrip, SplitCTA, Typografie-Skala). Header/Footer/Bottom-Bar sind über das Root-Layout automatisch sichtbar.
- `/styleguide` — Sprint-1-Seite weiterhin verfügbar, jetzt mit Sticky-Header und Footer eingerahmt.
- `/` — Minimal-Platzhalter (Sprint 3 = echte Startseite), ebenfalls mit globalem Chrome.

**Mobile-First testen:** DevTools ~375px → Bottom-Bar (4 Icons + Labels, aktiver Link markiert), Inhalt nicht verdeckt (`pb-bottombar`). Desktop: Sticky-Header schrumpft beim Scrollen + Glass-Hintergrund.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| Nav-Routen (404) | `src/lib/navigation.ts` → `NAV_LINKS` | Sprint 5 (Arbeiten/Über) / Sprint 6 (Journal) / Sprint 9 (Kontakt) |
| Kooperationen-Route (404) | `FOOTER_LEGAL[0]` | Sprint 9 |
| Impressum / Datenschutz (404) | `FOOTER_LEGAL[1–2]` | Sprint 9 (oder früher als statische Seiten) |
| Social-Links (`href="#"`) | `SOCIAL_LINKS` in `navigation.ts` | Sprint 9 / Sprint 10 |
| Mail-Adresse im Footer | `SiteFooter.tsx` → `mailto:mail@kilian-siebert.de` | Sprint 9 (Kontakt-Sprint) |
| `<Media id="placeholder">` in Galerie | `src/app/komponenten/page.tsx` | Sprint 7 (Object Storage) |
| Lokaler Bild-Fallback (`Media`) | `src/lib/media/local-provider.ts` | **Sprint 7** |

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### Navigation (geteilte Konfiguration)
```typescript
// src/lib/navigation.ts
NAV_LINKS:    NavLink[]   // 4 Hauptlinks — Header + Bottom-Bar
SOCIAL_LINKS: SocialLink[] // Instagram, TikTok, YouTube
FOOTER_LEGAL: NavLink[]   // Kooperationen, Impressum, Datenschutz
```
Sprint 3/5/6/9 befüllen die Routen, `navigation.ts` bleibt unverändert.

### Komponenten-Schnittstellen
```typescript
// Alle in src/components/ui/

Button: { variant: "primary"|"secondary", href?: string, children, ... }

GlassCard: { children, className?, shadow?: boolean }

ProjectCard: { id: string, title: string, meta?: string, href: string, alt?, sizes? }
// id → MediaRef (Sprint-7-Umbau: nur localProvider → objectStorageProvider in index.ts)

FactsStrip: { facts: Fact[], className? }  // Fact = { value, label }

SplitCTA: { left?: CTASide, right?: CTASide, className? }
// CTASide = { headline, subline?, buttonLabel, buttonHref }
// Default-Werte gesetzt → ohne Props sofort verwendbar
```

### Design-Token-Ergänzungen (globals.css)
- `--header-height: 64px`, `--header-height-sm: 48px` — Chrome-Höhen
- `--bottombar-height: 64px` — Mobile Bottom-Bar
- `--bottombar-label-size: 0.625rem` — Nano-Label
- `@utility grid-page` — 12-Spalten-Grid (Gutter 24px)
- `@utility pb-bottombar` / `@utility pt-header` — Layout-Helfer

---

## 4. Geklärte Offene Punkte aus Sprint 1

- **Button-Radius-Entscheidung:** Aufgelöst auf `rounded-md` (0.75 rem). Begründung: `design.md §Components` nennt explizit „Rounded-md" für Buttons; bestehender Code in `page.tsx` nutzte bereits `rounded-md`. Die allgemeinere `§Shapes`-Angabe (0.5rem) wird damit überschrieben.

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- **404-Routen:** `/arbeiten`, `/ueber`, `/journal`, `/kontakt`, `/kooperationen`, `/impressum`, `/datenschutz` zeigen alle 404 — dies ist bis zum jeweiligen Sprint bewusst so.
- **Animationen/Transitions:** Nur `transition-colors` und `transition-transform` (Karten-Hover, Header-Schrumpf). Volle Animations-Politur kommt Sprint 10.
- **Echte Inhalte:** Alle Texte in `SiteFooter`, `SplitCTA` und der Galerie sind Platzhalter.
- **Social-Links:** `href="#"` — erst real in Sprint 9/10.
- **Kooperationen-Seite:** Sprint 9 (Phase 3 laut Konzept).

---

## 6. Verzeichnisstruktur (neu in Sprint 2)

```
src/
  app/
    globals.css          ← + grid-page, pb-bottombar, pt-header, nav-tokens
    layout.tsx           ← + SiteHeader, SiteFooter, MobileBottomBar
    komponenten/
      page.tsx           ← Interne Komponenten-Galerie
  components/
    layout/
      SiteHeader.tsx     ← "use client" — Sticky-Top-Nav
      MobileBottomBar.tsx ← "use client" — Mobile Bottom-Bar
      SiteFooter.tsx     ← RSC — Footer
    ui/
      Button.tsx         ← Primary / Secondary
      GlassCard.tsx      ← Glassmorphism-Container
      ProjectCard.tsx    ← Karte (Arbeiten + Journal)
      FactsStrip.tsx     ← Zahlen-Zeile
      SplitCTA.tsx       ← Geteilter CTA-Block
  lib/
    navigation.ts        ← Geteilte Link-Konfiguration (Single Source)
```

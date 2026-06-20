# UI/UX-Änderungsleitfaden — Portfolio Kilian Siebert

**Für wen:** Alle, die visuelle, strukturelle oder inhaltliche Änderungen am
Frontend vornehmen — ob Farbwechsel, neue Seite, neuer Block-Typ oder Layout-Anpassung.

**Pflicht vor jeder UI-Arbeit:** `design.md` neu einlesen. Werte nie aus dem Kopf
ableiten.

---

## 1. Das Design-System auf einen Blick

### Token-Hierarchie (die einzige erlaubte Kette)

```
:root in globals.css              ← kanonische Werte (einzige Stelle für Hex/px)
       ↓
@theme inline in globals.css      ← Tailwind-Utilities referenzieren :root-Vars
       ↓
Komponenten / Seiten / Layouts    ← nur Tailwind-Utilities oder var(--…)
```

**Harte Regel (§0.2, Abnahme-Blocker):**
Kein Hex-Wert, keine px-Schriftgröße, kein Radius darf in einer Komponente stehen.

```tsx
// ✅ Erlaubt
<div className="bg-primary text-on-primary rounded-xl">
<div style={{ color: 'var(--color-primary)' }}>

// ❌ Verboten — gilt als Fehler in jeder Abnahme
<div className="bg-[#516051]">
<div style={{ color: '#516051' }}>
<div className="text-[64px]">
<div style={{ borderRadius: '1.5rem' }}>
```

**Erlaubte Ausnahme:** `src/app/globals.css` — nur dort stehen die Rohwerte.

### Audit-Befehl (vor jedem Commit ausführen)

```bash
grep -rn 'style={{[^}]*"#[0-9a-fA-F]' src/ --include="*.tsx"
grep -rn 'className="[^"]*\[#[0-9a-fA-F]' src/ --include="*.tsx"
# → beide Ausgaben müssen leer sein
```

---

## 2. Farben ändern

**Eine einzige Datei:** `src/app/globals.css` — der `:root`-Block (Zeilen 12–113).

### Farbpalette (Auszug, vollständig in `design.md`)

| Token | Verwendung | Wert (Rohwert) |
|---|---|---|
| `--color-primary` | Buttons, aktive Links, Fokus-Ringe, Tab-Aktiv-Zustand | `#516051` (Sage Green) |
| `--color-on-primary` | Text auf Primär-Hintergrund | `#ffffff` |
| `--color-surface` | Seiten-Hintergrund | `#faf9f6` (Cream Base) |
| `--color-on-surface` | Haupttext | `#1a1c1a` |
| `--color-on-surface-variant` | Sekundärtext, Labels, Platzhalter | `#3a3f39` |
| `--color-outline` | definierte Borders/Kanten (`--border-tonal`, Karten, Chrome) | `#747872` |
| `--color-outline-variant` | blasse Divider/Flächenraster (FactsStrip, Info-Boxen) | `#c4c8c0` |
| `--color-mist-blue` | Sekundär-Button-Rand (`border-mist-blue`) | `#d1dbe2` |
| `--color-sage-muted` | Brand-Anker (wenig direkt genutzt) | `#849483` |
| `--color-primary-container` | Hover-Zustand für Primär-Buttons | `#697969` |
| `--color-error` | Formular-Fehlermeldungen | `#ba1a1a` |

### So tauschst du eine Farbe app-weit

1. In `globals.css` → `:root` → Wert ändern (z. B. `--color-primary: #4a5c4a;`)
2. `pnpm dev` starten → alle Buttons, Links, Fokus-Ringe, Tab-Filter übernehmen sofort
3. Hex-Audit ausführen → leer
4. Zum Rücksetzen: Ursprungswert aus `design.md` wiederherstellen

---

## 3. Typografie ändern

**Datei:** `src/app/globals.css` → `@layer components` (Zeilen 224–273)

### Verfügbare Klassen

| Klasse | Verwendung | Font / Größe |
|---|---|---|
| `.type-display-lg` | H1, Hero-Headlines | Newsreader 400 · 40/48px mobil, 64/72px Desktop |
| `.type-headline-md` | H2, Abschnitts-Headlines | Newsreader 500 · 32/40px |
| `.type-body-lg` | Intro-Text, großer Fließtext | Newsreader 400 · 20/32px |
| `.type-body-md` | Standard-Fließtext | Newsreader 400 · 16/24px |
| `.type-label-caps` | Navigation, Tags, Eyebrow-Labels, Buttons | Inter 600 · 12/16px · uppercase |

**Fonts:** Newsreader (var `--font-newsreader`, `--font-display`, `--font-body`) und
Inter (var `--font-inter`, `--font-label`) — über `next/font/google` geladen,
kein externes CSS-Request (DSGVO-freundlich). Gewichte in `(frontend)/layout.tsx`.

**Regel:** Schriftgrößen nur über `.type-*`-Klassen setzen — nie `text-[20px]`.

---

## 4. Abstände und Layout

**Datei:** `src/app/globals.css` → `:root` (Zeilen 91–97) und `@utility`-Block (Zeilen ab 278)

### Wichtigste Layout-Utilities

| Utility | Funktion |
|---|---|
| `container-page` | Zentrierter Container, max 1280px, mobil 20px / Desktop 64px Randabstand |
| `section-gap` | `margin-top: 96px` — vertikaler Sektionsabstand (Redesign: dichter, vorher 120px) |
| `section-gap-y` | `margin-top + margin-bottom: 96px` |
| `grid-page` | 12-Spalten-Grid mit 24px Gutter |
| `pt-header` | `padding-top: 64px` — Abstand unter dem fixierten Header |
| `pb-bottombar` | `padding-bottom: 64px` — Abstand über der mobilen Bottom-Bar |

### Den Sektionsabstand ändern

`--section-gap: 96px;` in `:root` — wirkt auf alle `section-gap`/`section-gap-y`.

### Den Container verbreitern oder schmaler machen

`--container-max: 1280px;` in `:root`.

---

## 5. Komponenten-Inventar

### UI-Bausteine (`src/components/ui/`)

| Komponente | Datei | Verwendung |
|---|---|---|
| `Button` | `ui/Button.tsx` | Primär-/Sekundär-Button (`variant="primary" \| "secondary"`). Export `buttonClasses(variant)` für echte `<a download>`/externe Links, die den Button-Look teilen müssen (kein Hardcode-Duplikat). |
| `GlassCard` | `ui/GlassCard.tsx` | Erhöhte Karte — solide Fläche + definierte 1px-Border (Redesign: kein Glas/Blur mehr) |
| `ProjectCard` | `ui/ProjectCard.tsx` | Projekt-Kachel für `/arbeiten` mit Cover-Bild, Titel, Kategorie |
| `FactsStrip` | `ui/FactsStrip.tsx` | Zahlenleiste (3–4 Werte + Labels), wiederverwendbar auf mehreren Seiten |
| `SplitCTA` | `ui/SplitCTA.tsx` | 50/50-Block: Media links, Headline + Button rechts (oder umgekehrt) |

### Layout-Chrome (`src/components/layout/`)

| Komponente | Datei | Beschreibung |
|---|---|---|
| `SiteHeader` | `layout/SiteHeader.tsx` | Sticky-Top-Nav, schrumpft bei Scroll, solide Fläche + definierte Kante |
| `MobileBottomBar` | `layout/MobileBottomBar.tsx` | Fixe Bottom-Bar (nur mobil, `md:hidden`) |
| `SiteFooter` | `layout/SiteFooter.tsx` | Footer: 3 Spalten, Mail, Sitemap, Social, Legal |

### Medien (`src/components/`)

| Komponente | Datei | Beschreibung |
|---|---|---|
| `Media` | `Media.tsx` | **Einzige erlaubte Bild-Komponente.** Nimmt eine Payload-Media-ID und löst die CDN-URL auf. Nie direkte `<img>`-Tags oder `/public/`-Pfade in Pages. |
| `VideoLoop` | `VideoLoop.tsx` | HLS-Autoplay-Loop (hls.js), lazy via IntersectionObserver, Poster-Fallback, variant `hero`/`block` |

### Journal-Blöcke (`src/components/journal/blocks/`)

Die Blöcke werden vom `BlockRenderer` aus dem Payload-Layout-Array gerendert.

| Block | View-Komponente | Payload-Typ |
|---|---|---|
| Text (Lexical) | `TextBlockView.tsx` | `"text"` |
| Bild | `ImageBlockView.tsx` | `"image"` |
| Galerie | `GalleryBlockView.tsx` | `"gallery"` |
| Zitat | `QuoteBlockView.tsx` | `"quote"` |
| Video-Loop | `VideoBlockView.tsx` | `"video"` |
| Zwei-Spalten | `TwoColumnBlockView.tsx` | `"two-column"` |

---

## 6. Navigations-Änderungen

**Single Source of Truth:** `src/lib/navigation.ts`

Header, MobileBottomBar und Footer lesen alle aus dieser Datei — nichts in den
Komponenten direkt.

### Neuen Hauptnavigations-Link hinzufügen

```ts
// src/lib/navigation.ts → NAV_LINKS
export const NAV_LINKS: NavLink[] = [
  { href: "/arbeiten", label: "Arbeiten",  shortLabel: "Arbeiten" },
  { href: "/neueseite", label: "Neue Seite", shortLabel: "Neu" }, // ← hinzufügen
  // ...
];
```

> **Achtung Bottom-Bar:** Die Bottom-Bar zeigt alle 4 `NAV_LINKS` — bei 5+ Links
> wird sie optisch eng. Wenn du einen fünften Link brauchst, entweder die Anzahl
> begrenzen oder den BottomBar-Render auf eine gefilterte Subliste anpassen.
> Alternativ: Hamburger-Menü-Logik einbauen.

### Social-Links mit echten URLs füllen

```ts
export const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://instagram.com/kilian.siebert", label: "Instagram", platform: "instagram" },
  // ...
];
```

Footer zeigt Links automatisch, sobald `href !== "#"`.

---

## 7. Eine neue Seite anlegen

Alle öffentlichen Seiten gehören in die `(frontend)`-Route-Gruppe:

```
src/app/(frontend)/neue-seite/page.tsx
```

### Mindest-Template

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seitentitel",   // wird zu "Seitentitel — Kilian Siebert"
  description: "...",
};

export default function NeueSeite() {
  return (
    <div className="container-page section-gap pb-16">
      <p className="type-label-caps text-on-surface-variant mb-4">Eyebrow</p>
      <h1 className="type-display-lg text-on-surface mb-8">Headline.</h1>
      <p className="type-body-lg text-on-surface-variant max-w-prose">
        Fließtext hier.
      </p>
    </div>
  );
}
```

### Checkliste neue Seite

- [ ] In der Route-Gruppe `(frontend)` angelegt (benutzt das globale Layout mit Header/Footer)
- [ ] `export const metadata` gesetzt (title/description)
- [ ] Nur `.type-*`-Klassen für Typografie
- [ ] Nur Token-Utilities für Farben (`bg-primary`, `text-on-surface`, ...)
- [ ] Falls mit CMS-Daten: Fetcher in `src/lib/payload.ts` → `unstable_cache` + Tag
- [ ] Hex-Audit leer
- [ ] `pnpm check` grün

---

## 8. Daten aus dem CMS verwenden

**Datei:** `src/lib/payload.ts` — alle gecachten Fetcher.

### Muster für eine neue CMS-Seite

```tsx
// src/lib/payload.ts — Fetcher ergänzen:
export const getMyData = unstable_cache(
  async () => {
    const p = await payload();
    return p.findGlobal({ slug: "my-global" });
  },
  ["my-global"],
  { tags: ["my-global"] },
);

// src/hooks/revalidate.ts — Invalidierung ergänzen:
export const revalidateMyGlobal: GlobalAfterChangeHook = async ({ req }) => {
  revalidateTag("my-global");
  revalidatePath("/meine-seite");
};

// In der Payload-Collection/Global — Hook registrieren:
hooks: { afterChange: [revalidateMyGlobal] }
```

### Wie ISR funktioniert

1. Seite wird beim Build statisch gerendert (`pnpm build`)
2. Kilian ändert einen Inhalt im Admin → Payload feuert `afterChange`-Hook
3. Hook ruft `revalidateTag(tag)` + `revalidatePath(pfad)` auf
4. Beim nächsten Request rendert Next.js die Seite neu — automatisch, kein Deploy nötig

---

## 9. Bilder einbinden

**Immer** über die `<Media>`-Komponente, nie direkte Pfade:

```tsx
import Media from "@/components/Media";

// ✅ Richtig
<Media id={project.cover} alt="Projektcover" sizes="(max-width: 768px) 100vw, 50vw" />

// ❌ Falsch — bricht wenn Object-Storage-URL wechselt
<img src="/media/meinbild.jpg" />
<Image src="https://cdn.kilia-siebert.de/meinbild.jpg" alt="" width={800} height={600} />
```

**Priority für LCP-Bilder** (erstes sichtbares Bild):
```tsx
<Media id={hero.image} priority />
```

---

## 10. Videos einbinden

```tsx
import VideoLoop from "@/components/VideoLoop";
import { resolveVideo } from "@/lib/media";  // liefert ResolvedVideo

// Hero (edge-to-edge, kein Radius)
<VideoLoop video={resolvedVideo} posterSrc={posterUrl} variant="hero" />

// Block (rounded-xl, Controls bei Hover)
<VideoLoop video={resolvedVideo} posterSrc={posterUrl} variant="block" />
```

Videos kommen aus der `Videos`-Collection — Upload im Admin → FFmpeg transkodiert
zu HLS 1080/720/480p → Segmente landen in MinIO/Object Storage.

---

## 11. Journal-Block hinzufügen

Um einen neuen Block-Typ im Journal zu ermöglichen:

1. **Payload-Block-Definition** anlegen: `src/blocks/MeinBlock.ts`
   ```ts
   import type { Block } from "payload";
   export const MeinBlock: Block = {
     slug: "mein-block",
     fields: [ /* Felder */ ],
   };
   ```

2. **Block-View-Komponente** anlegen: `src/components/journal/blocks/MeinBlockView.tsx`

3. **In `JournalPosts`-Collection** registrieren (`src/collections/JournalPosts.ts` → `layout.blocks`)

4. **Im `BlockRenderer`** (`src/components/journal/BlockRenderer.tsx`) den neuen Typ mappen

5. `pnpm payload generate:types` ausführen → `payload-types.ts` aktualisiert

---

## 12. Responsive Design

Das Konzept ist **Mobile-First** — immer mit dem kleinsten Breakpoint anfangen,
dann mit `md:` / `lg:` aufweiten.

| Breakpoint | Tailwind-Prefix | Breite |
|---|---|---|
| Mobil (Default) | — | < 768px |
| Tablet / Desktop | `md:` | ≥ 768px |
| Großes Desktop | `lg:` | ≥ 1024px |

Die Bottom-Bar (`pb-bottombar`) verschwindet ab `md:` — dort `md:pb-0` nutzen.

**Wichtig:** Header (`pt-header`) und Bottom-Bar (`pb-bottombar`) sind fixe Chrome-Elemente.
Jede neue Seite braucht `pt-header` oder zumindest einen gleichwertigen Abstand oben,
damit der Inhalt nicht hinter dem Header verschwindet.

---

## 13. Accessibility — was bei Änderungen zu beachten ist

### Fokus-Ringe (Sprint 10)

Alle interaktiven Elemente (Links, Buttons, Tabs) brauchen `focus-visible:`-Ringe:
```tsx
className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
```

Das `Button`-Component (`src/components/ui/Button.tsx:48`) ist die Referenz-Implementierung.
Bei neuen Buttons/Links immer dasselbe Muster verwenden.

### ARIA-Rollen

- `role="tablist"` + `role="tab"` → immer mit Arrow-Key-Navigation (Roving-Tabindex)
  kombinieren — Referenz: `WorksGrid.tsx`
- `<nav>` immer mit `aria-label` versehen (Header: `"Hauptnavigation"`, Footer: nicht als `<nav>`, BottomBar: `"Mobile Navigation"`)
- Dekorative Icons: `aria-hidden="true"` (Referenz: Bottom-Bar-Icons)
- Fehlermeldungen im Formular: `role="alert"` (Referenz: `ContactForm.tsx`)

### Skip-Link

Bereits im globalen Layout implementiert (`(frontend)/layout.tsx`). Neue Seiten
erben ihn automatisch — nichts zu tun.

### Alt-Texte

`<Media>` füllt `alt` aus dem Payload-Medien-Modell (`media.alt`). Beim Upload
im Admin immer einen aussagekräftigen Alt-Text setzen.

---

## 14. Elevation und Tiefe

Laut `design.md` — keine klassischen Drop-Shadows auf Chrome/Karten, kein Glas mehr
(Redesign „härtere Kanten"). Bild-Wrapper (Startseite) sind die Ausnahme: dort Schatten
**und** spitze Kante zusammen.

| Ebene | Token / Klasse | Verwendung |
|---|---|---|
| Surface 0 (Base) | `bg-surface` | Seitenhintergrund |
| Surface 1 (Chrome) | `bg-surface` bzw. `style={{ backgroundColor: 'var(--color-surface)' }}` — deckend, kein Blur | Header, BottomBar |
| Surface 1 (Karten) | `bg-surface-container-lowest` — deckend | GlassCard, ProjectCard |
| Border statt Shadow | `border border-outline` bzw. `var(--border-tonal)` (= 1px solid `outline`) | Karten-Umrandung, Chrome-Kanten, Trennlinien — definierte Linie |
| Ambient Shadow | `shadow-ambient` (Utility, `globals.css` → `--shadow-ambient`) | Bild-Wrapper auf der Startseite (Portrait in `IntroSection`, Kacheln in `WhatIDoSection`) — kombiniert mit `rounded-none` + `border border-outline-variant` auf dem inneren Crop-Container |

**Wichtig:** `shadow-ambient` immer auf einen *äußeren* Wrapper setzen, nicht auf das
Element mit `overflow-hidden` — sonst clippt der Crop-Container den eigenen Schatten
weg (CSS-Falle, kein Bug im Token). Muster:

```tsx
<div className="shadow-ambient">
  <div className="relative overflow-hidden rounded-none border border-outline-variant">
    <Media ... />
  </div>
</div>
```

---

## 15. Qualitäts-Check — vor jedem Commit

```bash
# 1. Typen + Lint
pnpm check

# 2. Hex-Audit (muss leer sein)
grep -rn 'style={{[^}]*"#[0-9a-fA-F]' src/ --include="*.tsx"
grep -rn 'className="[^"]*\[#[0-9a-fA-F]' src/ --include="*.tsx"

# 3. Build (zeigt alle Seiten und ihren Render-Modus)
pnpm build
```

---

## 16. Häufige Fallen

| Situation | Falsch | Richtig |
|---|---|---|
| Farbe setzen | `text-[#333732]` | `text-charcoal-text` |
| Schriftgröße setzen | `text-2xl` oder `text-[20px]` | `type-body-lg` |
| Radius setzen | `rounded-[12px]` | `rounded-xl` (= 12px, Redesign) |
| Abstand setzen | `mt-[120px]` | `section-gap` |
| Bild einbinden | `<img src="...">` | `<Media id={...} />` |
| Schatten auf Bild-Crop | `shadow-ambient` direkt auf `overflow-hidden`-Element | `shadow-ambient` auf äußerem Wrapper, `overflow-hidden` auf innerem Crop-Container |
| Neuer Nav-Link | direkt in `SiteHeader.tsx` | `src/lib/navigation.ts` |
| Token-Wert nachschlagen | aus dem Kopf | `design.md` + `globals.css` lesen |
| CMS-Daten laden | `fetch('/api/...')` im Client | `unstable_cache`-Fetcher in `src/lib/payload.ts` |

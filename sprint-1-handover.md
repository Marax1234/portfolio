# Sprint-1-Übergabe — Fundament & Design-System-Kern

**Datum:** 2026-06-17  
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- `pnpm dev` → App startet auf `http://localhost:3000`
- `/` — Minimale Startseite (Platzhalter, Sprint 3 = echte Startseite)
- `/styleguide` — Interne Token-Demoseite: alle Farben (46 Tokens), 5 Typo-Stufen, 6 Radien, 3 Elevation-Varianten (Tonal Border, Glassmorphism, Ambient Shadow), Medien-Abstraktion-Demo mit lokalem Bild-Fallback

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei | Ersetzt in |
|---|---|---|
| Lokaler Bild-Fallback | `src/lib/media/local-provider.ts` | **Sprint 7** (Object Storage) |
| Bild-Manifest | `src/lib/media/local-provider.ts` → `MANIFEST` | Sprint 7 |
| Bilder in `public/media/` | `public/media/placeholder.svg` | Sprint 7 |
| Minimal-Startseite | `src/app/page.tsx` | **Sprint 3** |

**Einzige Umbau-Stelle (Sprint 7):** `src/lib/media/index.ts` — `localProvider` durch `objectStorageProvider` ersetzen. Alle Aufrufer (`<Media>`, Seiten) bleiben unverändert.

---

## 3. Schnittstellen / Verträge (Folge-Sprints docken hier an)

### Medien-Abstraktion
```typescript
// src/lib/media/types.ts
interface MediaRef      { id: string }
interface ResolvedMedia { src, width, height, alt, blurDataURL?, unoptimized? }
interface MediaProvider { resolve(ref: MediaRef): ResolvedMedia | Promise<ResolvedMedia> }

// Verwendung in Komponenten:
import Media from "@/components/Media";
<Media id="some-image" alt="..." sizes="(max-width: 768px) 100vw, 50vw" />
```

### Token-Konvention
- Kanonische Werte: `src/app/globals.css` → `:root { --color-* … }`
- Tailwind-Utilities: `@theme inline { --color-*: var(--color-*) … }`
- Typo-Klassen: `.type-display-lg`, `.type-headline-md`, `.type-body-lg`, `.type-body-md`, `.type-label-caps`
- Layout-Utilities: `.container-page`, `.section-gap`, `.section-gap-y`
- Elevation: `var(--glass-bg)`, `var(--glass-blur)`, `var(--border-tonal)`, `var(--shadow-ambient)`

**Pflicht:** Kein Hardcode in Komponenten (§0.2 Sprintplan). `CLAUDE.md` enthält die Regel und Audit-Command.

---

## 4. Bekannte offene Punkte / bewusste Auslassungen

- **Navigation / Footer:** Sprint 2
- **Echte Seiteninhalte:** Sprint 3 (Startseite), Sprint 5 (datengetrieben)
- **CMS / Payload:** Sprint 4
- **Video-Loop / HLS:** Sprint 8
- **Dark Mode:** Nicht geplant (Design-System ist hell/warm; kein `@media prefers-color-scheme:dark` vorgesehen)
- **Animationen/Transitions:** Bewusst noch nicht; erst wenn Layout steht (Sprint 10 Politur)
- **button-Radius-Inkonsistenz in design.md:** design.md beschreibt Buttons als `0.5rem` (rounded) in Shapes, aber als `rounded-md` (0.75rem) in Components. Sprint 2 klärt und entscheidet — für Sprint 1 irrelevant.

---

## 5. Verzeichnisstruktur (neu in Sprint 1)

```
src/
  app/
    globals.css          ← Token-SoT (einzige erlaubte Quelle)
    layout.tsx           ← Fonts (Newsreader, Inter) + Body-Defaults
    page.tsx             ← Minimal-Startseite (Sprint-3-Platzhalter)
    styleguide/
      page.tsx           ← Interne Token-Demoseite
  lib/
    media/
      types.ts           ← MediaRef, ResolvedMedia, MediaProvider
      local-provider.ts  ← Sprint-1-Fallback (→ Sprint 7 ersetzt)
      index.ts           ← Singleton mediaProvider (einzige Umbau-Stelle)
  components/
    Media.tsx            ← Universelle Bild-Komponente

public/
  media/
    placeholder.svg      ← Sprint-1-Bild-Fallback

CLAUDE.md                ← Entwicklungsregeln & Token-Pflicht-Regel
sprint-1-handover.md     ← Dieses Dokument
```

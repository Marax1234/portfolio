/**
 * /styleguide — Interne Token-Demoseite (Sprint 1)
 *
 * Zeigt alle Design-Tokens aus design.md als visuellen Beweis:
 * Farben, Typografie, Radien, Elevation, Medien-Abstraktion.
 *
 * Verwendungszweck:
 * 1. Zentralitäts-Test: Primärfarbe in globals.css (:root) ändern
 *    → alle primärfarbigen Elemente hier ziehen nach → zurücksetzen.
 * 2. Referenz für Folge-Sprints (welche Utility-Klassen existieren).
 * 3. Konsistenz-Abnahme in jedem Sprint.
 *
 * REGEL: Diese Seite benutzt ausschließlich Token-Utilities und var(--…).
 * Kein Hardcode.
 */

import Media from "@/components/Media";

/* ── Daten für die Farbpalette-Anzeige ─────────────────────────────── */
const colorGroups = [
  {
    label: "Brand / Synesthetic",
    tokens: [
      { name: "cream-base",    cssVar: "--color-cream-base",    hex: "#FAF9F6" },
      { name: "sage-muted",    cssVar: "--color-sage-muted",    hex: "#849483" },
      { name: "petal-pink",    cssVar: "--color-petal-pink",    hex: "#E8D5D5" },
      { name: "mist-blue",     cssVar: "--color-mist-blue",     hex: "#D1DBE2" },
      { name: "charcoal-text", cssVar: "--color-charcoal-text", hex: "#333732" },
    ],
  },
  {
    label: "Primary",
    tokens: [
      { name: "primary",                  cssVar: "--color-primary",                  hex: "#3F5440" },
      { name: "on-primary",               cssVar: "--color-on-primary",               hex: "#FFFFFF" },
      { name: "primary-container",        cssVar: "--color-primary-container",        hex: "#56735A" },
      { name: "on-primary-container",     cssVar: "--color-on-primary-container",     hex: "#F7FFF3" },
      { name: "primary-fixed",            cssVar: "--color-primary-fixed",            hex: "#D6E7D4" },
      { name: "primary-fixed-dim",        cssVar: "--color-primary-fixed-dim",        hex: "#BACBB8" },
      { name: "on-primary-fixed",         cssVar: "--color-on-primary-fixed",         hex: "#111F13" },
      { name: "on-primary-fixed-variant", cssVar: "--color-on-primary-fixed-variant", hex: "#3C4A3C" },
    ],
  },
  {
    label: "Secondary",
    tokens: [
      { name: "secondary",                  cssVar: "--color-secondary",                  hex: "#5C5550" },
      { name: "on-secondary",               cssVar: "--color-on-secondary",               hex: "#FFFFFF" },
      { name: "secondary-container",        cssVar: "--color-secondary-container",        hex: "#E2DCD3" },
      { name: "on-secondary-container",     cssVar: "--color-on-secondary-container",     hex: "#5C5550" },
      { name: "secondary-fixed",            cssVar: "--color-secondary-fixed",            hex: "#DDD5CB" },
      { name: "secondary-fixed-dim",        cssVar: "--color-secondary-fixed-dim",        hex: "#B8ADA0" },
      { name: "on-secondary-fixed",         cssVar: "--color-on-secondary-fixed",         hex: "#211D19" },
      { name: "on-secondary-fixed-variant", cssVar: "--color-on-secondary-fixed-variant", hex: "#4A443D" },
    ],
  },
  {
    label: "Tertiary",
    tokens: [
      { name: "tertiary",                  cssVar: "--color-tertiary",                  hex: "#545D63" },
      { name: "on-tertiary",               cssVar: "--color-on-tertiary",               hex: "#FFFFFF" },
      { name: "tertiary-container",        cssVar: "--color-tertiary-container",        hex: "#6C767C" },
      { name: "on-tertiary-container",     cssVar: "--color-on-tertiary-container",     hex: "#FBFDFF" },
      { name: "tertiary-fixed",            cssVar: "--color-tertiary-fixed",            hex: "#DAE4EB" },
      { name: "tertiary-fixed-dim",        cssVar: "--color-tertiary-fixed-dim",        hex: "#BEC8CF" },
      { name: "on-tertiary-fixed",         cssVar: "--color-on-tertiary-fixed",         hex: "#131D22" },
      { name: "on-tertiary-fixed-variant", cssVar: "--color-on-tertiary-fixed-variant", hex: "#3E484E" },
    ],
  },
  {
    label: "Surface",
    tokens: [
      { name: "surface",                   cssVar: "--color-surface",                   hex: "#FAF9F6" },
      { name: "surface-dim",               cssVar: "--color-surface-dim",               hex: "#DBDAD7" },
      { name: "surface-bright",            cssVar: "--color-surface-bright",            hex: "#FAF9F6" },
      { name: "surface-container-lowest",  cssVar: "--color-surface-container-lowest",  hex: "#FFFFFF" },
      { name: "surface-container-low",     cssVar: "--color-surface-container-low",     hex: "#F4F3F1" },
      { name: "surface-container",         cssVar: "--color-surface-container",         hex: "#EFEEEB" },
      { name: "surface-container-high",    cssVar: "--color-surface-container-high",    hex: "#E9E8E5" },
      { name: "surface-container-highest", cssVar: "--color-surface-container-highest", hex: "#E3E2E0" },
      { name: "surface-variant",           cssVar: "--color-surface-variant",           hex: "#E3E2E0" },
      { name: "surface-tint",              cssVar: "--color-surface-tint",              hex: "#45593F" },
      { name: "on-surface",                cssVar: "--color-on-surface",                hex: "#1A1C1A" },
      { name: "on-surface-variant",        cssVar: "--color-on-surface-variant",        hex: "#434842" },
    ],
  },
  {
    label: "Outline & Inverse",
    tokens: [
      { name: "outline",            cssVar: "--color-outline",            hex: "#747872" },
      { name: "outline-variant",    cssVar: "--color-outline-variant",    hex: "#C4C8C0" },
      { name: "inverse-surface",    cssVar: "--color-inverse-surface",    hex: "#2F312F" },
      { name: "inverse-on-surface", cssVar: "--color-inverse-on-surface", hex: "#F2F1EE" },
      { name: "inverse-primary",    cssVar: "--color-inverse-primary",    hex: "#A3C298" },
    ],
  },
  {
    label: "Error",
    tokens: [
      { name: "error",              cssVar: "--color-error",              hex: "#BA1A1A" },
      { name: "on-error",           cssVar: "--color-on-error",           hex: "#FFFFFF" },
      { name: "error-container",    cssVar: "--color-error-container",    hex: "#FFDAD6" },
      { name: "on-error-container", cssVar: "--color-on-error-container", hex: "#93000A" },
    ],
  },
];

/* ── Radii-Tokens ─────────────────────────────────────────────────── */
const radiiTokens = [
  { name: "sm",   cssVar: "--radius-sm",   value: "0.25rem",  tailwind: "rounded-sm" },
  { name: "DEFAULT", cssVar: "--radius",   value: "0.5rem",   tailwind: "rounded" },
  { name: "md",   cssVar: "--radius-md",   value: "0.75rem",  tailwind: "rounded-md" },
  { name: "lg",   cssVar: "--radius-lg",   value: "1rem",     tailwind: "rounded-lg" },
  { name: "xl",   cssVar: "--radius-xl",   value: "1.5rem",   tailwind: "rounded-xl" },
  { name: "full", cssVar: "--radius-full", value: "9999px",   tailwind: "rounded-full" },
];

/* ── Spacing-Tokens ───────────────────────────────────────────────── */
const spacingTokens = [
  { name: "unit",           cssVar: "--spacing-unit",   value: "8px" },
  { name: "container-max", cssVar: "--container-max",   value: "1280px" },
  { name: "gutter",        cssVar: "--gutter",          value: "24px" },
  { name: "margin-mobile", cssVar: "--margin-mobile",   value: "20px" },
  { name: "margin-desktop",cssVar: "--margin-desktop",  value: "64px" },
  { name: "section-gap",   cssVar: "--section-gap",     value: "120px" },
];

/* ── Typo-Stufen ──────────────────────────────────────────────────── */
const typoSteps = [
  {
    cls: "type-display-lg",
    label: "display-lg",
    spec: "Newsreader 300 · 40→64px / 48→72px · ls -0.02em",
    sample: "Synesthetic Light",
  },
  {
    cls: "type-headline-md",
    label: "headline-md",
    spec: "Newsreader 400 · 32px / 40px",
    sample: "Tonal Serenity",
  },
  {
    cls: "type-body-lg",
    label: "body-lg",
    spec: "Newsreader 400 · 20px / 32px",
    sample: "Ein Portfolio, das Stille ausstrahlt und Arbeit trägt.",
  },
  {
    cls: "type-body-md",
    label: "body-md",
    spec: "Newsreader 400 · 16px / 24px",
    sample:
      "Der Standard-Fließtext für Beschreibungen, Bildunterschriften und Fließtext im Journal. Genug Abstand für ruhiges Lesen.",
  },
  {
    cls: "type-label-caps",
    label: "label-caps",
    spec: "Inter 600 · 12px / 16px · ls 0.08em · uppercase",
    sample: "Navigation · Tags · Kategorien",
  },
];

/* ─────────────────────────────────────────────────────────────────── */

export default function StyleguidePage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-primary-fixed border-b border-outline-variant">
        <div className="container-page py-8">
          <p className="type-label-caps text-primary mb-2">Intern · nicht verlinkt</p>
          <h1 className="type-display-lg text-on-surface">Design-System</h1>
          <p className="type-body-lg text-on-surface-variant mt-4">
            Token-Demoseite — Sprint 1. Alle Werte aus{" "}
            <code
              className="type-label-caps bg-surface-container px-2 py-1 rounded"
              style={{ textTransform: "none", letterSpacing: "0" }}
            >
              design.md
            </code>
            .{" "}
            <span className="text-primary">Zentralitäts-Test:</span>{" "}
            <code
              className="type-label-caps bg-surface-container px-2 py-1 rounded"
              style={{ textTransform: "none", letterSpacing: "0" }}
            >
              --color-primary
            </code>{" "}
            in{" "}
            <code
              className="type-label-caps bg-surface-container px-2 py-1 rounded"
              style={{ textTransform: "none", letterSpacing: "0" }}
            >
              globals.css
            </code>{" "}
            ändern → alle primärfarbigen Elemente ziehen nach → zurücksetzen.
          </p>
        </div>
      </div>

      <div className="container-page py-12 space-y-20">

        {/* ── 1. FARBEN ────────────────────────────────────────────── */}
        <section>
          <h2 className="type-headline-md text-on-surface mb-2">Farben</h2>
          <p className="type-label-caps text-on-surface-variant mb-8">
            {colorGroups.reduce((n, g) => n + g.tokens.length, 0)} Tokens · alle aus design.md
          </p>
          <div className="space-y-10">
            {colorGroups.map((group) => (
              <div key={group.label}>
                <p className="type-label-caps text-on-surface-variant mb-4">{group.label}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      className="rounded-xl overflow-hidden border border-outline-variant"
                      style={{ boxShadow: "var(--shadow-ambient)" }}
                    >
                      {/* Farb-Swatch */}
                      <div
                        className="h-16 w-full"
                        style={{ backgroundColor: `var(${token.cssVar})` }}
                      />
                      {/* Label */}
                      <div className="bg-surface-container-lowest p-2">
                        <p
                          className="type-label-caps text-on-surface-variant"
                          style={{ fontSize: "0.625rem" }}
                        >
                          {token.name}
                        </p>
                        <p
                          className="type-label-caps text-outline"
                          style={{ fontSize: "0.625rem", textTransform: "none", letterSpacing: "0" }}
                        >
                          {token.hex}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-outline-variant" />

        {/* ── 2. TYPOGRAFIE ────────────────────────────────────────── */}
        <section>
          <h2 className="type-headline-md text-on-surface mb-2">Typografie</h2>
          <p className="type-label-caps text-on-surface-variant mb-8">
            Newsreader (Display / Body) · Inter (Labels)
          </p>
          <div className="space-y-12">
            {typoSteps.map((step) => (
              <div
                key={step.cls}
                className="border-l-2 border-primary-fixed pl-6"
              >
                <div className="flex flex-wrap items-baseline gap-4 mb-3">
                  <span className="type-label-caps text-primary">{step.label}</span>
                  <span
                    className="type-label-caps text-outline-variant"
                    style={{ textTransform: "none", letterSpacing: "0" }}
                  >
                    {step.spec}
                  </span>
                </div>
                <p className={`${step.cls} text-on-surface`}>{step.sample}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-outline-variant" />

        {/* ── 3. RADIEN ────────────────────────────────────────────── */}
        <section>
          <h2 className="type-headline-md text-on-surface mb-2">Radien</h2>
          <p className="type-label-caps text-on-surface-variant mb-8">6 Stufen</p>
          <div className="flex flex-wrap gap-6 items-end">
            {radiiTokens.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 bg-primary-fixed border border-primary"
                  style={{ borderRadius: `var(${r.cssVar})` }}
                />
                <div className="text-center">
                  <p className="type-label-caps text-on-surface">{r.name}</p>
                  <p
                    className="type-label-caps text-outline"
                    style={{ fontSize: "0.625rem", textTransform: "none", letterSpacing: "0" }}
                  >
                    {r.value}
                  </p>
                  <p
                    className="type-label-caps text-outline-variant"
                    style={{ fontSize: "0.625rem", textTransform: "none", letterSpacing: "0" }}
                  >
                    .{r.tailwind}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-outline-variant" />

        {/* ── 4. SPACING ────────────────────────────────────────────── */}
        <section>
          <h2 className="type-headline-md text-on-surface mb-2">Spacing & Layout</h2>
          <p className="type-label-caps text-on-surface-variant mb-8">
            8px-Einheit · 1280px-Container · 120px Section-Gap
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {spacingTokens.map((s) => (
              <div
                key={s.name}
                className="bg-surface-container rounded-xl p-4 border border-outline-variant"
              >
                <p className="type-label-caps text-primary mb-1">{s.name}</p>
                <p className="type-headline-md text-on-surface">{s.value}</p>
                <p
                  className="type-label-caps text-outline-variant mt-1"
                  style={{ textTransform: "none", letterSpacing: "0" }}
                >
                  {s.cssVar}
                </p>
              </div>
            ))}
          </div>

          {/* Container-Max visuell */}
          <div className="mt-8 bg-primary-fixed rounded-xl p-4">
            <p className="type-label-caps text-primary mb-2">
              Container-Max (1280px) — diese Box ist in .container-page eingebettet
            </p>
            <div className="h-4 bg-primary rounded" style={{ width: "100%" }} />
            <p className="type-label-caps text-on-surface-variant mt-2" style={{ textTransform: "none" }}>
              ← volle Breite des Content-Bereichs →
            </p>
          </div>
        </section>

        <div className="border-t border-outline-variant" />

        {/* ── 5. ELEVATION / DEPTH ─────────────────────────────────── */}
        <section>
          <h2 className="type-headline-md text-on-surface mb-2">Elevation & Depth</h2>
          <p className="type-label-caps text-on-surface-variant mb-8">
            Drei Varianten aus design.md §Elevation
          </p>
          <div className="grid gap-6 sm:grid-cols-3">

            {/* Surface 0: Tonal Border */}
            <div
              className="p-6 rounded-xl bg-surface"
              style={{ border: "var(--border-tonal)" }}
            >
              <p className="type-label-caps text-primary mb-3">Tonal Border</p>
              <p className="type-body-md text-on-surface-variant">
                1px solid outline-variant. Definiert Kanten ohne Drop-Shadow —
                die primäre Depth-Methode.
              </p>
              <p className="type-label-caps text-outline-variant mt-4" style={{ textTransform: "none" }}>
                border: var(--border-tonal)
              </p>
            </div>

            {/* Surface 1: Glassmorphism */}
            <div
              className="p-6 rounded-xl relative overflow-hidden"
              style={{
                border: "var(--border-tonal)",
                position: "relative",
              }}
            >
              {/* Hintergrund-Gradient als "Bleeding-through" Simulation */}
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background: "linear-gradient(135deg, var(--color-petal-pink), var(--color-mist-blue))",
                }}
              />
              <div
                className="absolute inset-0 -z-[5]"
                style={{
                  backgroundColor: "var(--glass-bg)",
                  backdropFilter: `blur(var(--glass-blur))`,
                }}
              />
              <p className="type-label-caps text-primary mb-3">Glassmorphism</p>
              <p className="type-body-md text-on-surface-variant">
                80% white opacity + 16px backdrop-blur. Pastell-Gradient blendet
                durch — der Synesthetic-Effekt.
              </p>
              <p className="type-label-caps text-outline-variant mt-4" style={{ textTransform: "none" }}>
                --glass-bg · --glass-blur
              </p>
            </div>

            {/* Ambient Shadow */}
            <div
              className="p-6 rounded-xl bg-surface-container-lowest"
              style={{ boxShadow: "var(--shadow-ambient)" }}
            >
              <p className="type-label-caps text-primary mb-3">Ambient Shadow</p>
              <p className="type-body-md text-on-surface-variant">
                Ultra-diffused, 10% Sage-Tint. Nur für interaktive Elemente —
                sparsam einsetzen.
              </p>
              <p className="type-label-caps text-outline-variant mt-4" style={{ textTransform: "none" }}>
                box-shadow: var(--shadow-ambient)
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-outline-variant" />

        {/* ── 6. MEDIEN-ABSTRAKTION ────────────────────────────────── */}
        <section>
          <h2 className="type-headline-md text-on-surface mb-2">Medien-Abstraktion</h2>
          <p className="type-label-caps text-on-surface-variant mb-4">
            Sprint 1 — lokaler Fallback · Sprint 7: Object Storage
          </p>
          <p className="type-body-md text-on-surface-variant mb-8">
            Das Bild unten wird über{" "}
            <code
              className="type-label-caps bg-surface-container px-2 py-1 rounded"
              style={{ textTransform: "none", letterSpacing: "0" }}
            >
              &lt;Media id=&quot;placeholder&quot; /&gt;
            </code>{" "}
            geladen. Die Komponente kennt keine Pfade — sie ruft{" "}
            <code
              className="type-label-caps bg-surface-container px-2 py-1 rounded"
              style={{ textTransform: "none", letterSpacing: "0" }}
            >
              mediaProvider.resolve()
            </code>{" "}
            auf.
          </p>
          <div
            className="rounded-xl overflow-hidden border border-outline-variant"
            style={{ maxWidth: "480px" }}
          >
            <Media
              id="placeholder"
              alt="Platzhalter-Bild aus der Medien-Abstraktion (Sprint 1)"
              className="w-full"
              imageClassName="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </div>
          <p className="type-label-caps text-outline-variant mt-4" style={{ textTransform: "none" }}>
            Quelle: /public/media/placeholder.svg · Provider: LocalProvider ·
            Sprint 7 Umbau: nur src/lib/media/index.ts
          </p>
        </section>

        <div className="border-t border-outline-variant" />

        {/* ── 7. ZENTRALITÄTS-TEST ANLEITUNG ──────────────────────── */}
        <section className="bg-inverse-surface rounded-xl p-8">
          <p className="type-label-caps text-inverse-primary mb-4">Abnahme-Test (§0.2)</p>
          <h3 className="type-headline-md text-inverse-on-surface mb-4">
            Zentralitäts-Test durchführen
          </h3>
          <ol className="space-y-3 text-inverse-on-surface">
            <li className="type-body-md flex gap-3">
              <span className="type-label-caps text-inverse-primary shrink-0">01</span>
              <span>
                In <code style={{ fontFamily: "monospace" }}>src/app/globals.css</code>, Zeile{" "}
                <code style={{ fontFamily: "monospace" }}>--color-primary: #3f5440</code> auf{" "}
                <code style={{ fontFamily: "monospace" }}>--color-primary: #aa0000</code> ändern.
              </span>
            </li>
            <li className="type-body-md flex gap-3">
              <span className="type-label-caps text-inverse-primary shrink-0">02</span>
              <span>Seite neu laden → alle primärfarbigen Elemente (Swatch, Borders, Labels …) müssen jetzt rot sein.</span>
            </li>
            <li className="type-body-md flex gap-3">
              <span className="type-label-caps text-inverse-primary shrink-0">03</span>
              <span>Gleiches mit <code style={{ fontFamily: "monospace" }}>--section-gap</code>.</span>
            </li>
            <li className="type-body-md flex gap-3">
              <span className="type-label-caps text-inverse-primary shrink-0">04</span>
              <span>Zurücksetzen auf Originalwerte.</span>
            </li>
            <li className="type-body-md flex gap-3">
              <span className="type-label-caps text-inverse-primary shrink-0">05</span>
              <span>Hardcode-Audit: <code style={{ fontFamily: "monospace" }}>grep -rn &quot;#[0-9a-fA-F]&quot; src/ --include=&quot;*.tsx&quot; --include=&quot;*.ts&quot;</code> → muss leer sein.</span>
            </li>
          </ol>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="type-label-caps text-outline-variant">
            Sprint 1 · Design-System &bdquo;Tonal Serenity / Synesthetic Light&ldquo;
          </p>
        </div>

      </div>
    </main>
  );
}

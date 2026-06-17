/**
 * Komponenten-Galerie (Sprint 2) — interne Route /komponenten
 *
 * Zeigt alle Sprint-2-Bausteine in realistischem Kontext:
 * Buttons, GlassCard, ProjectCard, FactsStrip, SplitCTA.
 *
 * Dient dem Zentralitäts-Test (§0.2): Ein Radius- oder Farbtoken ändern →
 * Wirkung schlägt hier galerieweit durch.
 *
 * Analoges Muster zur /styleguide-Seite aus Sprint 1.
 */

import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import ProjectCard from "@/components/ui/ProjectCard";
import FactsStrip, { type Fact } from "@/components/ui/FactsStrip";
import SplitCTA from "@/components/ui/SplitCTA";

const FACTS: Fact[] = [
  { value: "3×",     label: "Mitteldistanz Triathlon" },
  { value: "14",     label: "Länder bereist" },
  { value: "seit 2021", label: "Mit der Kamera unterwegs" },
  { value: "∞",     label: "Geschichten zu erzählen" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section-gap">
      <div className="mb-8">
        <p className="type-label-caps text-on-surface-variant mb-2">Baustein</p>
        <h2 className="type-headline-md text-on-surface">{title}</h2>
        {description && (
          <p className="type-body-md text-on-surface-variant mt-3 max-w-prose">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function KomponentenPage() {
  return (
    <div className="container-page py-16">
      {/* Seitenkopf */}
      <header className="mb-4">
        <p className="type-label-caps text-primary mb-3">Sprint 2 — Interne Galerie</p>
        <h1 className="type-display-lg text-on-surface">Komponenten</h1>
        <p className="type-body-lg text-on-surface-variant mt-4 max-w-prose">
          Alle wiederverwendbaren Bausteine. Zentral gepflegt, token-basiert.
          Zentralitäts-Test: Einen Token in globals.css ändern — die Wirkung
          schlägt hier überall durch.
        </p>
      </header>

      {/* ── Buttons ──────────────────────────────────────────────── */}
      <Section
        title="Buttons"
        description="Primary (solid Sage/Cream) und Secondary (Ghost, Mist-Blue-Border). Radius: rounded-md (0.75 rem — Sprint-2-Entscheidung)."
      >
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Jetzt anfragen</Button>
          <Button variant="secondary">Mehr erfahren</Button>
          <Button variant="primary" href="/kontakt">
            Link als Button
          </Button>
          <Button variant="secondary" href="/arbeiten">
            Zur Galerie →
          </Button>
          <Button variant="primary" disabled>
            Deaktiviert
          </Button>
        </div>
      </Section>

      {/* ── GlassCard ────────────────────────────────────────────── */}
      <Section
        title="GlassCard"
        description="Frosted-Glass-Container — var(--glass-bg) + 16px Blur, 1px Tonal-Border, keine Schatten (design.md §Elevation)."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-8">
            <p className="type-label-caps text-on-surface-variant mb-2">Ohne Shadow</p>
            <p className="type-body-md text-on-surface">
              Glassmorphism-Fläche mit Tonal-Border. Hintergrund-Inhalte
              scheinen durch.
            </p>
          </GlassCard>

          <GlassCard shadow className="p-8">
            <p className="type-label-caps text-on-surface-variant mb-2">Mit Ambient Shadow</p>
            <p className="type-body-md text-on-surface">
              Optionaler ultra-diffuser Sage-Schatten (10% Deckkraft).
            </p>
          </GlassCard>

          <GlassCard className="p-8">
            <p className="type-label-caps text-on-surface-variant mb-2">Mit Button</p>
            <p className="type-body-md text-on-surface mb-4">
              Karten können Aktionen enthalten.
            </p>
            <Button variant="primary">Aktion</Button>
          </GlassCard>
        </div>
      </Section>

      {/* ── ProjectCard ──────────────────────────────────────────── */}
      <Section
        title="ProjectCard"
        description="Geteiltes Bauteil für Arbeiten & Journal. Cover via <Media id=…> (Medien-Abstraktion §0.5 — Sprint 7 ersetzt lokalen Fallback). Hover: Bild-Zoom + Titel-Farbwechsel."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard
            id="placeholder"
            title="Triathlon EM 2024 — Hamburg"
            meta="Sport · Juni 2024"
            href="/arbeiten/triathlon-em-2024"
          />
          <ProjectCard
            id="placeholder"
            title="Hochzeit Lisa & Max"
            meta="Hochzeit · Mai 2024"
            href="/arbeiten/hochzeit-lisa-max"
          />
          <ProjectCard
            id="placeholder"
            title="Durch Marokko — 14 Tage, 2.400 km"
            meta="Reise · März 2024"
            href="/journal/marokko-2024"
          />
        </div>
      </Section>

      {/* ── FactsStrip ───────────────────────────────────────────── */}
      <Section
        title="FactsStrip"
        description="Zahlen-Credibility-Zeile (Konzept §4.1). Mobil 2×2, Desktop 1×4."
      >
        <FactsStrip facts={FACTS} />
      </Section>

      {/* ── SplitCTA ─────────────────────────────────────────────── */}
      <Section
        title="SplitCTA"
        description="Geteilter CTA-Block am Seitenende. Links Privatkunden (Primary-Ton), rechts Marken/Sponsoren (Secondary-Ton). Mobil gestapelt, Desktop 50/50."
      >
        <SplitCTA />
      </Section>

      {/* ── Typografie-Referenz ──────────────────────────────────── */}
      <Section
        title="Typografie-Skala"
        description="Alle type-* Klassen aus globals.css (Sprint 1). Zur Kontrolle hier gezeigt."
      >
        <div className="space-y-6 border border-outline-variant rounded-xl p-8 bg-surface-container-lowest">
          <div>
            <p className="type-label-caps text-on-surface-variant mb-1">.type-display-lg</p>
            <p className="type-display-lg text-on-surface">Kilian Siebert</p>
          </div>
          <div className="border-t border-outline-variant pt-6">
            <p className="type-label-caps text-on-surface-variant mb-1">.type-headline-md</p>
            <p className="type-headline-md text-on-surface">Fotograf & Videograf</p>
          </div>
          <div className="border-t border-outline-variant pt-6">
            <p className="type-label-caps text-on-surface-variant mb-1">.type-body-lg</p>
            <p className="type-body-lg text-on-surface">Ich filme das, was sich zu erleben lohnt.</p>
          </div>
          <div className="border-t border-outline-variant pt-6">
            <p className="type-label-caps text-on-surface-variant mb-1">.type-body-md</p>
            <p className="type-body-md text-on-surface">
              Auf dem Rad genauso wie auf einer Hochzeit. Seit 2021, in 14 Ländern.
            </p>
          </div>
          <div className="border-t border-outline-variant pt-6">
            <p className="type-label-caps text-on-surface-variant mb-1">.type-label-caps</p>
            <p className="type-label-caps text-on-surface">Sport · Reisen · Menschen</p>
          </div>
        </div>
      </Section>

      {/* Abstand vor Footer-Übergang */}
      <div className="section-gap" />
    </div>
  );
}

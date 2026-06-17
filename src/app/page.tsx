/**
 * Startseite — Sprint 3 (statisch, Platzhalterinhalte)
 *
 * Konzept §4.1: „Der Pitch in einem Scroll" — Person → Können → Pfade.
 * Modulreihenfolge (Sprintplan Sprint 3):
 *   Hero → Intro → Was ich mache → Featured → Fakten-Strip →
 *   Aus dem Journal → geteilter CTA → Footer (global aus layout.tsx).
 *
 * Alle Module bestehen aus Sprint-2-Bausteinen (Button, FactsStrip,
 * ProjectCard, SplitCTA) bzw. neuen Sprint-3-Sections in
 * src/components/home/ — keine Duplikate.
 *
 * Inhalte sind Platzhalter im Tone of Voice (§7) — Sprint 5 ersetzt sie
 * durch echte Payload-Daten, die Modulstruktur bleibt unverändert.
 *
 * Kein Hardcode (§0.2).
 */

import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import WhatIDoSection from "@/components/home/WhatIDoSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import JournalTeaserSection from "@/components/home/JournalTeaserSection";
import FactsStrip, { type Fact } from "@/components/ui/FactsStrip";
import SplitCTA from "@/components/ui/SplitCTA";

const FACTS: Fact[] = [
  { value: "3×", label: "Mitteldistanz Triathlon" },
  { value: "14", label: "Länder bereist" },
  { value: "seit 2021", label: "Mit der Kamera unterwegs" },
  { value: "∞", label: "Geschichten zu erzählen" },
];

export default function Home() {
  return (
    <>
      {/* Full-Bleed — bewusst außerhalb von container-page */}
      <HeroSection />

      <div className="container-page">
        <IntroSection className="section-gap" />
        <WhatIDoSection className="section-gap" />
        <FeaturedSection className="section-gap" />
        <FactsStrip facts={FACTS} className="section-gap" />
        <JournalTeaserSection className="section-gap" />
        <SplitCTA className="section-gap" />

        {/* Abstand vor globalem Footer */}
        <div className="section-gap" />
      </div>
    </>
  );
}

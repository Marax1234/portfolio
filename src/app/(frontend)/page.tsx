/**
 * Startseite — Sprint 5 (datengetrieben, Payload + ISR)
 *
 * Konzept §4.1: „Der Pitch in einem Scroll" — Person → Können → Pfade.
 * Modulreihenfolge (unverändert seit Sprint 3):
 *   Hero → Intro → Was ich mache → Featured → Fakten-Strip →
 *   Aus dem Journal → geteilter CTA → Footer (global aus layout.tsx).
 *
 * Inhalte kommen jetzt aus `SiteConfig` + dem featured `Project` +
 * `JournalPosts` (src/lib/payload.ts, getaggt + ISR-fähig über
 * src/hooks/revalidate.ts). Wo ein Feld (noch) leer ist, fallen die
 * Section-Komponenten selbst auf die Sprint-3-Platzhalter zurück.
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
import { payloadMediaRef } from "@/lib/media";
import { formatMeta, getFeaturedProject, getJournalTeasers, getSiteConfig } from "@/lib/payload";

export default async function Home() {
  const [siteConfig, featuredProject, journalTeasers] = await Promise.all([
    getSiteConfig(),
    getFeaturedProject(),
    getJournalTeasers(3),
  ]);

  const facts: Fact[] = (siteConfig.facts ?? []).map(({ value, label }) => ({ value, label }));

  const whatIDoTiles = (siteConfig.whatIDoTiles ?? []).flatMap((tile) => {
    const ref = payloadMediaRef(tile.media);
    return ref ? [{ key: String(tile.id ?? tile.label), label: tile.label, href: tile.href, ref }] : [];
  });

  const ctaLeft = siteConfig.ctaLeft?.headline
    ? {
        headline: siteConfig.ctaLeft.headline,
        subline: siteConfig.ctaLeft.subline ?? undefined,
        buttonLabel: siteConfig.ctaLeft.buttonLabel ?? "Kontakt",
        buttonHref: siteConfig.ctaLeft.buttonHref ?? "/kontakt",
      }
    : undefined;

  const ctaRight = siteConfig.ctaRight?.headline
    ? {
        headline: siteConfig.ctaRight.headline,
        subline: siteConfig.ctaRight.subline ?? undefined,
        buttonLabel: siteConfig.ctaRight.buttonLabel ?? "Kooperationen",
        buttonHref: siteConfig.ctaRight.buttonHref ?? "/kooperationen",
      }
    : undefined;

  const journalEntries = journalTeasers.flatMap((post) => {
    const ref = payloadMediaRef(post.cover, { alt: post.title });
    return ref
      ? [
          {
            key: String(post.id),
            ref,
            title: post.title,
            meta: formatMeta(post.category, post.publishedAt),
            href: `/journal/${post.slug}`,
          },
        ]
      : [];
  });

  return (
    <>
      {/* Full-Bleed — bewusst außerhalb von container-page */}
      <HeroSection
        eyebrow={siteConfig.hero?.eyebrow ?? undefined}
        name={siteConfig.hero?.name ?? undefined}
        tagline={siteConfig.hero?.tagline ?? undefined}
        scrollHint={siteConfig.hero?.scrollHint ?? undefined}
        poster={payloadMediaRef(siteConfig.hero?.poster)}
      />

      <div className="container-page">
        <IntroSection
          className="section-gap"
          eyebrow={siteConfig.intro?.eyebrow ?? undefined}
          portrait={payloadMediaRef(siteConfig.intro?.portrait)}
          body={siteConfig.intro?.body}
        />
        <WhatIDoSection
          className="section-gap"
          eyebrow={siteConfig.whatIDo?.eyebrow ?? undefined}
          headline={siteConfig.whatIDo?.headline ?? undefined}
          tiles={whatIDoTiles.length > 0 ? whatIDoTiles : undefined}
        />
        <FeaturedSection
          className="section-gap"
          cover={payloadMediaRef(featuredProject?.cover, { alt: featuredProject?.title })}
          title={featuredProject?.title}
          excerpt={featuredProject?.excerpt ?? undefined}
          ctaLabel={featuredProject?.ctaLabel ?? undefined}
          ctaHref={featuredProject?.ctaHref ?? (featuredProject ? `/arbeiten/${featuredProject.slug}` : undefined)}
        />
        {facts.length > 0 && <FactsStrip facts={facts} className="section-gap" />}
        <JournalTeaserSection
          className="section-gap"
          eyebrow={siteConfig.journalTeaser?.eyebrow ?? undefined}
          headline={siteConfig.journalTeaser?.headline ?? undefined}
          entries={journalEntries.length > 0 ? journalEntries : undefined}
        />
        <SplitCTA className="section-gap" left={ctaLeft} right={ctaRight} />

        {/* Abstand vor globalem Footer */}
        <div className="section-gap" />
      </div>
    </>
  );
}

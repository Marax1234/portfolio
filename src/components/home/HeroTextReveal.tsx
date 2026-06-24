"use client";

interface HeroTextRevealProps {
  eyebrow: string;
  name: string;
  tagline: string;
  scrollHint: string;
}

export default function HeroTextReveal({
  eyebrow,
  name,
  tagline,
  scrollHint,
}: HeroTextRevealProps) {
  return (
    <div className="relative z-10 container-page pb-16 md:pb-24">
      <p
        data-animate
        className="type-label-caps text-inverse-on-surface/80 mb-4"
        style={{
          animation: "fade-in 500ms var(--ease-out-strong) 100ms both",
        }}
      >
        {eyebrow}
      </p>
      <h1
        data-animate
        className="type-display-lg text-inverse-on-surface"
        style={{
          animation:
            "clip-reveal-x var(--duration-hero) var(--ease-out-strong) 300ms both",
        }}
      >
        {name}
      </h1>
      <p
        data-animate
        className="type-body-lg text-inverse-on-surface/90 mt-4 max-w-md"
        style={{
          animation: "fade-in-up 600ms var(--ease-out-strong) 900ms both",
        }}
      >
        {tagline}
      </p>
      <p
        className="type-label-caps text-inverse-on-surface/70 mt-12"
        style={{
          animation: "breathe 3s linear infinite",
          animationDelay: "1.5s",
        }}
      >
        {scrollHint}
      </p>
    </div>
  );
}

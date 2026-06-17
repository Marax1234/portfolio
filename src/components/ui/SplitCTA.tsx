/**
 * SplitCTA — geteilter CTA-Block „Anfragen" vs. „Zusammenarbeiten" (Sprint 2)
 *
 * Konzept §5: „Geteilter CTA-Block — ‚Anfragen' vs. ‚Zusammenarbeiten'.
 * Taucht am Ende mehrerer Seiten auf."
 *
 * Zwei 50/50-Hälften (mobil gestapelt, Desktop nebeneinander).
 * Linke Hälfte (primary-Ton) → Privatkunden / Kontakt.
 * Rechte Hälfte (secondary-Ton) → Marken / Kooperationen.
 *
 * Kein Hardcode (§0.2).
 */

import Button from "@/components/ui/Button";

interface CTASide {
  headline: string;
  subline?: string;
  buttonLabel: string;
  buttonHref: string;
}

interface SplitCTAProps {
  left?: CTASide;
  right?: CTASide;
  className?: string;
}

const defaultLeft: CTASide = {
  headline: "Projekt anfragen.",
  subline: "Hochzeit, Reise oder Event — ich freue mich von dir zu hören.",
  buttonLabel: "Jetzt anfragen",
  buttonHref: "/kontakt",
};

const defaultRight: CTASide = {
  headline: "Zusammenarbeiten.",
  subline: "Content für Marken und Sponsoren — lass uns reden.",
  buttonLabel: "Kooperation anfragen",
  buttonHref: "/kooperationen",
};

function CTAHalf({
  side,
  tone,
}: {
  side: CTASide;
  tone: "primary" | "secondary";
}) {
  const bgClass =
    tone === "primary"
      ? "bg-primary-fixed"
      : "bg-secondary-fixed";
  const textClass =
    tone === "primary"
      ? "text-on-primary-fixed"
      : "text-on-secondary-fixed";
  const subClass =
    tone === "primary"
      ? "text-on-primary-fixed-variant"
      : "text-on-secondary-fixed-variant";

  return (
    <div
      className={[
        "flex flex-col justify-between gap-8",
        "px-8 py-12 md:px-12 md:py-16",
        bgClass,
      ].join(" ")}
    >
      <div className="flex flex-col gap-4">
        <h2 className={["type-headline-md", textClass].join(" ")}>
          {side.headline}
        </h2>
        {side.subline && (
          <p className={["type-body-md max-w-xs", subClass].join(" ")}>
            {side.subline}
          </p>
        )}
      </div>
      <div>
        <Button href={side.buttonHref} variant={tone === "primary" ? "primary" : "secondary"}>
          {side.buttonLabel}
        </Button>
      </div>
    </div>
  );
}

export default function SplitCTA({
  left = defaultLeft,
  right = defaultRight,
  className = "",
}: SplitCTAProps) {
  return (
    <div
      className={[
        "grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden",
        className,
      ].join(" ")}
      style={{ border: "var(--border-tonal)" }}
    >
      <CTAHalf side={left} tone="primary" />
      <CTAHalf side={right} tone="secondary" />
    </div>
  );
}

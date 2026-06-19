/**
 * GlassCard — erhöhte Karte (Sprint 2; Redesign: solide statt Glas)
 *
 * Redesign „härtere Kanten": deckende Fläche (surface-container-lowest) mit
 * definierter 1px-Border (--border-tonal) statt 80%-Weiß + Blur. Tiefe über
 * die Kante, optional zusätzlicher Ambient-Shadow.
 *
 * Kein Hardcode (§0.2): alle Werte über Utilities/CSS-Variablen aus globals.css.
 */

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Optionaler Ambient-Shadow zusätzlich zur Tonal-Border */
  shadow?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  shadow = false,
}: GlassCardProps) {
  return (
    <div
      className={["rounded-xl overflow-hidden bg-surface-container-lowest", className].filter(Boolean).join(" ")}
      style={{
        border: "var(--border-tonal)",
        boxShadow: shadow ? "var(--shadow-ambient)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * GlassCard — Glassmorphism-Container (Sprint 2)
 *
 * design.md §Elevation: Surface 1 = semi-transparent white (80% opacity)
 * + 16px backdrop blur. Tiefe via 1px-Border (--border-tonal), kein Schatten.
 *
 * Kein Hardcode (§0.2): alle Werte über CSS-Variablen aus globals.css.
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
      className={["rounded-xl overflow-hidden", className].filter(Boolean).join(" ")}
      style={{
        backgroundColor: "var(--glass-bg)",
        backdropFilter: `blur(var(--glass-blur))`,
        WebkitBackdropFilter: `blur(var(--glass-blur))`,
        border: "var(--border-tonal)",
        boxShadow: shadow ? "var(--shadow-ambient)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * FactsStrip — Zeile mit 3–4 Zahlen (Sprint 2)
 *
 * Konzept §5: „Fakten-Strip — eine Zeile mit 3–4 Zahlen. Wiederholbar
 * auf mehreren Seiten." §4.1: „3× Mitteldistanz · 14 Länder · seit 2021 —
 * Fakten-Strip (Credibility)."
 *
 * Mobil: gestapelt (1 Spalte). Desktop: nebeneinander (3–4 Spalten).
 * Zahlen type-headline-md, Labels type-label-caps.
 *
 * Redesign „Anti-Slop" (Radius-Hierarchie statt einheitlich großem Radius):
 * Foto-Cards auf der Startseite nutzen rounded-xl. Diese Daten-Rasterzeile
 * ist bewusst eine Stufe kantiger — rounded-lg — damit sie sich von den
 * weichen Bild-Kacheln abhebt statt denselben Radius überall zu wiederholen.
 *
 * Kein Hardcode (§0.2).
 */

export interface Fact {
  value: string;
  label: string;
}

interface FactsStripProps {
  facts: Fact[];
  className?: string;
}

export default function FactsStrip({ facts, className = "" }: FactsStripProps) {
  return (
    <div
      className={[
        "grid grid-cols-2 md:grid-cols-4 gap-px",
        "bg-outline-variant rounded-lg overflow-hidden",
        className,
      ].join(" ")}
    >
      {facts.map(({ value, label }) => (
        <div
          key={label}
          className="bg-surface-container-lowest px-6 py-8 flex flex-col gap-2"
        >
          <span className="type-headline-md text-on-surface">{value}</span>
          <span className="type-label-caps text-on-surface-variant">{label}</span>
        </div>
      ))}
    </div>
  );
}

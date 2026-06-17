import type { QuoteBlock } from "@/payload-types";

/** Zitat-Block — hervorgehoben innerhalb der Lesespalte, rein über Tokens gestylt. */
export default function QuoteBlockView({ quote, attribution }: QuoteBlock) {
  return (
    <blockquote className="max-w-prose mx-auto border-l-2 border-primary pl-6">
      <p className="type-headline-md text-on-surface">{quote}</p>
      {attribution && <footer className="type-label-caps text-on-surface-variant mt-3">{attribution}</footer>}
    </blockquote>
  );
}

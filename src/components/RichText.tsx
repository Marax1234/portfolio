/**
 * <RichText> — dünner Wrapper um Payloads Lexical-RichText-Renderer
 * (Sprint 5). Einziger erlaubter Weg, `richText`-Felder (Intro/Projekt/
 * Journal/About-`body`/`story`) darzustellen — Styling ausschließlich über
 * Token-Utilities/`type-*`-Klassen (§0.2), kein Hardcode in Convertern.
 */
import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

/**
 * Generierte Payload-Typen modellieren `richText`-Felder strukturell
 * kompatibel zu `SerializedEditorState`, aber mit `[k: string]: unknown`/
 * `any`-Children (siehe payload-types.ts) statt des präzisen Lexical-Typs —
 * daher der explizite, dokumentierte Cast (analog zum `sharp`-Cast in
 * payload.config.ts).
 */
type RichTextDoc = { root: unknown; [k: string]: unknown };

interface RichTextProps {
  data?: RichTextDoc | null;
  className?: string;
}

export default function RichText({ data, className }: RichTextProps) {
  if (!data) return null;

  return (
    <div className={className}>
      <PayloadRichText data={data as unknown as SerializedEditorState} />
    </div>
  );
}

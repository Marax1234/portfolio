import RichText from "@/components/RichText";
import type { TextBlock } from "@/payload-types";

/** Text-Block — schmale Lesespalte (Konzept §4.4). */
export default function TextBlockView({ content }: TextBlock) {
  return <RichText data={content} className="type-body-lg text-on-surface max-w-prose mx-auto" />;
}

import type { Journal } from "@/payload-types";
import GalleryBlockView from "./blocks/GalleryBlockView";
import ImageBlockView from "./blocks/ImageBlockView";
import QuoteBlockView from "./blocks/QuoteBlockView";
import TextBlockView from "./blocks/TextBlockView";
import TwoColumnBlockView from "./blocks/TwoColumnBlockView";
import VideoBlockView from "./blocks/VideoBlockView";

/**
 * <BlockRenderer> — schaltet über `block.blockType` auf die jeweilige
 * Block-Komponente (Sprint 6, §0.2 token-basiert). Unbekannte Block-Typen
 * werden ignoriert, statt die Seite zum Absturz zu bringen.
 */
export default function BlockRenderer({ blocks }: { blocks: Journal["layout"] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block, index) => {
        const key = block.id ?? index;
        switch (block.blockType) {
          case "text":
            return <TextBlockView key={key} {...block} />;
          case "image":
            return <ImageBlockView key={key} {...block} />;
          case "gallery":
            return <GalleryBlockView key={key} {...block} />;
          case "twoColumn":
            return <TwoColumnBlockView key={key} {...block} />;
          case "quote":
            return <QuoteBlockView key={key} {...block} />;
          case "video":
            return <VideoBlockView key={key} {...block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

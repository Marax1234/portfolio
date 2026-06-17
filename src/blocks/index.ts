import type { Block } from "payload";
import { GalleryBlock } from "./GalleryBlock";
import { ImageBlock } from "./ImageBlock";
import { QuoteBlock } from "./QuoteBlock";
import { TextBlock } from "./TextBlock";
import { TwoColumnBlock } from "./TwoColumnBlock";
import { VideoBlock } from "./VideoBlock";

/**
 * Block-Bibliothek für das Journal-Layout-Feld (Sprint 6, Konzept §4.4).
 * Frei stapel- und sortierbar pro Beitrag — Layout-Freiheit ohne Code.
 * `src/components/journal/BlockRenderer.tsx` rendert die Gegenstücke.
 */
export const journalBlocks: Block[] = [
  TextBlock,
  ImageBlock,
  GalleryBlock,
  TwoColumnBlock,
  QuoteBlock,
  VideoBlock,
];

export { GalleryBlock, ImageBlock, QuoteBlock, TextBlock, TwoColumnBlock, VideoBlock };

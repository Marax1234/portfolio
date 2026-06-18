/**
 * Revalidate-Hooks (Sprint 5 — ISR, §0.6 „Inhalt im Admin ändern → Frontend
 * zeigt die Änderung ohne manuellen Rebuild").
 *
 * Payloads Local API läuft im selben Next.js-Prozess (siehe
 * tech-stack-konfiguration.md §2.2) — `afterChange`/`afterDelete`-Hooks
 * können `revalidateTag`/`revalidatePath` daher direkt aufrufen, ohne
 * Umweg über einen Route-Handler.
 *
 * Tag-Strategie: `src/lib/payload.ts` cached jede Abfrage mit `unstable_cache`
 * unter genau diesen Tags. `revalidatePath` zusätzlich für die Routen, deren
 * `generateStaticParams`/Statik direkt von der geänderten Collection abhängt
 * (insb. Prev/Next-Nachbarn auf `/arbeiten/[slug]`).
 */
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * `revalidateTag`/`revalidatePath` setzen einen aktiven Next.js-Request-
 * Kontext voraus. Skripte außerhalb von Next (z.B. `payload run` für
 * `pnpm seed`) haben den nicht — dort wird stattdessen explizit
 * `context.disableRevalidate` gesetzt (siehe src/seed/index.ts). Der
 * try/catch hier ist nur ein zusätzliches Sicherheitsnetz.
 */
function revalidate(tag: string, paths: string[]) {
  try {
    revalidateTag(tag, "max");
    for (const path of paths) revalidatePath(path);
  } catch {
    // Außerhalb eines Next.js-Request-Kontexts (z.B. Standalone-Skripte) — no-op.
  }
}

export const revalidateProjects: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("projects", ["/", "/arbeiten", `/arbeiten/${doc.slug}`]);
  return doc;
};

export const revalidateProjectsDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("projects", ["/", "/arbeiten", `/arbeiten/${doc.slug}`]);
  return doc;
};

export const revalidateJournal: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("journal", ["/", "/journal", `/journal/${doc.slug}`]);
  return doc;
};

export const revalidateJournalDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("journal", ["/", "/journal", `/journal/${doc.slug}`]);
  return doc;
};

export const revalidateSiteConfig: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("site-config", ["/"]);
  return doc;
};

export const revalidateAboutPage: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("about-page", ["/ueber"]);
  return doc;
};

/**
 * Media-Dokumente werden von Projekten, Journalbeiträgen, SiteConfig und
 * AboutPage referenziert (Relationship-Felder) — ohne Rückwärtssuche lässt
 * sich nicht eingrenzen, welche dieser Entitäten ein bestimmtes Bild
 * tatsächlich verwendet. Statt einer teuren Reverse-Lookup-Query daher
 * bewusst grobkörnig: jede Änderung an `media` invalidiert alle vier Tags +
 * die zugehörigen Pfade. Tausch eines Bildes im Admin (z.B. Intro-Portrait)
 * zeigt sich damit sofort im Frontend, ohne dass zusätzlich das jeweilige
 * Projekt/Global gespeichert werden muss.
 */
export const revalidateMedia: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("projects", ["/", "/arbeiten"]);
  revalidate("journal", ["/", "/journal"]);
  revalidate("site-config", ["/"]);
  revalidate("about-page", ["/ueber"]);
  return doc;
};

export const revalidateMediaDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidate("projects", ["/", "/arbeiten"]);
  revalidate("journal", ["/", "/journal"]);
  revalidate("site-config", ["/"]);
  revalidate("about-page", ["/ueber"]);
  return doc;
};

/**
 * Schlichte Slug-Erzeugung für Payload-`beforeValidate`-Hooks
 * (Projects, JournalPosts) — z.B. "Triathlon EM 2024 — Hamburg"
 * → "triathlon-em-2024-hamburg".
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // diakritische Zeichen entfernen
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

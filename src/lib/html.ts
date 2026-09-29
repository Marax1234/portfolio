const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escaped Text für HTML-Inhalt und Attributwerte in Anführungszeichen
 * (z.B. Mail-Templates mit Nutzereingaben).
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

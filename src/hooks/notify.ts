/**
 * Benachrichtigungs-Hooks (Sprint 9 — Kontakt, Inbox & Kooperationen).
 *
 * Sendet eine Admin-Benachrichtigung per E-Mail, wenn eine neue
 * Kontaktanfrage eingeht. Schlägt der Mailversand fehl, bleibt der
 * Datenbank-Eintrag erhalten — kein Fehler wird nach oben geworfen.
 *
 * In der Entwicklung (kein SMTP konfiguriert) nutzt der nodemailerAdapter
 * automatisch einen Ethereal-Test-Account; die Preview-URL wird geloggt
 * (dev-Nachweis des Sprint-9-Akzeptanzkriteriums).
 */
import type { CollectionAfterChangeHook } from "payload";

const NOTIFY_TO =
  process.env.CONTACT_NOTIFY_TO ??
  process.env.SEED_ADMIN_EMAIL ??
  "admin@kilian-siebert.de";

const CATEGORY_LABELS: Record<string, string> = {
  hochzeit: "Hochzeit",
  reise: "Reise",
  marke: "Marke",
  sonstiges: "Sonstiges",
};

export const notifyContactSubmission: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload, context },
}) => {
  // Nur bei neuen Einträgen, nicht bei Updates oder Seed-Runs
  if (operation !== "create") return doc;
  if (context.disableRevalidate) return doc;

  try {
    const name = String(doc.name ?? "–");
    const email = String(doc.email ?? "–");
    const message = String(doc.message ?? "–");
    const categoryLabel = CATEGORY_LABELS[String(doc.category ?? "")] ?? String(doc.category ?? "–");

    const subject = `Neue Kontaktanfrage von ${name} (${categoryLabel})`;

    const html = `
      <h2>Neue Kontaktanfrage</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Kategorie:</strong> ${categoryLabel}</p>
      <hr />
      <p><strong>Nachricht:</strong></p>
      <p style="white-space: pre-wrap">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    `.trim();

    const text =
      `Neue Kontaktanfrage\n\n` +
      `Name: ${name}\n` +
      `E-Mail: ${email}\n` +
      `Kategorie: ${categoryLabel}\n\n` +
      `Nachricht:\n${message}`;

    await payload.sendEmail({ to: NOTIFY_TO, subject, html, text });

    payload.logger.info(`[notify] Benachrichtigung für Anfrage von ${email} gesendet.`);
  } catch (err) {
    // Mail-Fehler dürfen niemals den DB-Eintrag verhindern — nur loggen.
    payload.logger.error(
      { err },
      "[notify] Mail-Versand fehlgeschlagen — Eintrag trotzdem gespeichert.",
    );
  }

  return doc;
};

"use server";

/**
 * Server Action fuer das Kontaktformular (Sprint 9, Konzept §4.6).
 *
 * 1. Honeypot — stille Ablehnung wenn befuellt (Bot-Trap, kein Fehler)
 * 2. Timing  — Ablehnung wenn < 1500 ms seit Seitenload (zu schnell)
 * 3. Validation — Name, E-Mail, Kategorie, Nachricht (Mindestlaenge)
 * 4. Persist  — Local API: payload.create("contact-submissions", ...)
 *               Der afterChange-Hook (src/hooks/notify.ts) sendet die
 *               Admin-Benachrichtigung; Fehler dort werfen keinen Error.
 *
 * Kein revalidatePath/Tag — ContactSubmissions hat keine oeffentliche Seite.
 */

import config from "@payload-config";
import { getPayload } from "payload";

export type ContactFormState = {
  ok: boolean;
  errors?: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CATEGORIES = ["hochzeit", "reise", "marke", "sonstiges"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // 1. Honeypot — befuellt == Bot → still erfolgreich (kein Hinweis fuer Bot)
  const honeypot = (formData.get("website") as string | null) ?? "";
  if (honeypot.length > 0) {
    return { ok: true };
  }

  // 2. Timing-Check — zu schnell (< 1500 ms) == wahrscheinlich Bot
  const rawTs = formData.get("_ts") as string | null;
  const ts = rawTs ? parseInt(rawTs, 10) : 0;
  if (ts > 0 && Date.now() - ts < 1500) {
    return {
      ok: false,
      errors: { form: "Bitte fuell das Formular noch einmal aus." },
    };
  }

  // 3. Felder extrahieren
  const name = ((formData.get("name") as string | null) ?? "").trim();
  const email = ((formData.get("email") as string | null) ?? "").trim();
  const category = ((formData.get("category") as string | null) ?? "").trim();
  const message = ((formData.get("message") as string | null) ?? "").trim();

  // 4. Validation
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Name ist erforderlich.";
  if (!email) {
    errors.email = "E-Mail ist erforderlich.";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Ungueltige E-Mail-Adresse.";
  }
  if (!category || !VALID_CATEGORIES.includes(category as Category)) {
    errors.category = "Bitte waehle eine Kategorie.";
  }
  if (!message) {
    errors.message = "Nachricht ist erforderlich.";
  } else if (message.length < 10) {
    errors.message = "Bitte schreib etwas mehr (mind. 10 Zeichen).";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // 5. In Payload speichern — afterChange-Hook sendet die Benachrichtigung
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "contact-submissions",
      data: {
        name,
        email,
        category: category as Category,
        message,
      },
      // Kein disableRevalidate → notifyContactSubmission-Hook feuert
    });
    return { ok: true };
  } catch (err) {
    console.error("[submitContact] Fehler beim Speichern:", err);
    return {
      ok: false,
      errors: { form: "Ein Fehler ist aufgetreten. Bitte versuch es spaeter erneut." },
    };
  }
}

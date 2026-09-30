"use client";

/**
 * ContactForm — Kontaktformular (Sprint 9, Konzept §4.6).
 *
 * Felder: Name, E-Mail, "Worum geht's?" (Dropdown), Nachricht.
 * Spam-Schutz: Honeypot-Feld + Timing-Timestamp (gesetzt via useEffect).
 *
 * Styling: editorialer Bottom-Border-Stil (design.md "Buttons & Inputs").
 * Kein Hardcode (§0.2) — ausschliesslich Tailwind-Utilities aus @theme inline.
 */

import { useActionState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import { submitContact, type ContactFormState } from "./actions";

const INITIAL: ContactFormState = { ok: false };

// Editorialer Input-Stil: Bottom-Border, transparenter Hintergrund
const fieldBase =
  "w-full bg-transparent border-b border-outline-variant py-3 type-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors";
const fieldErrCls = "border-error focus:border-error";
const labelCls = "block type-label-caps text-on-surface-variant mb-2";
const errCls = "mt-1 type-label-caps text-error";

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, INITIAL);

  // Timing-Schutz: Timestamp wird client-seitig nach Hydration gesetzt,
  // damit Server-Side-Rendering keinen festen Wert einsetzt.
  const tsRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
  }, []);

  // Erfolgs-Ansicht
  if (state.ok) {
    return (
      <div className="rounded-xl border border-outline-variant p-8 text-center section-gap">
        <p className="type-headline-md text-on-surface mb-3">Danke.</p>
        <p className="type-body-md text-on-surface-variant">
          Ich melde mich bald bei dir.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-8 section-gap">
      {/* Honeypot — fuer echte Nutzer unsichtbar, Bots fuellen es oft aus */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      {/* Timing-Schutz: Timestamp */}
      <input ref={tsRef} type="hidden" name="_ts" defaultValue="0" />

      {/* Globaler Fehler (z.B. Server-Fehler) */}
      {state.errors?.form && (
        <p className={errCls} role="alert">
          {state.errors.form}
        </p>
      )}

      {/* Name + E-Mail nebeneinander auf Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <label htmlFor="contact-name" className={labelCls}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Dein Name"
            className={[fieldBase, state.errors?.name ? fieldErrCls : ""].join(" ")}
          />
          {state.errors?.name && (
            <p className={errCls} role="alert">
              {state.errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelCls}>
            E-Mail
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="deine@email.de"
            className={[fieldBase, state.errors?.email ? fieldErrCls : ""].join(" ")}
          />
          {state.errors?.email && (
            <p className={errCls} role="alert">
              {state.errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Kategorie-Dropdown */}
      <div>
        <label htmlFor="contact-category" className={labelCls}>
          Worum geht&apos;s?
        </label>
        <select
          id="contact-category"
          name="category"
          required
          className={[fieldBase, state.errors?.category ? fieldErrCls : ""].join(" ")}
          defaultValue=""
        >
          <option value="" disabled>
            Bitte waehlen &hellip;
          </option>
          <option value="hochzeit">Hochzeit</option>
          <option value="reise">Reise</option>
          <option value="marke">Marke</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
        {state.errors?.category && (
          <p className={errCls} role="alert">
            {state.errors.category}
          </p>
        )}
      </div>

      {/* Nachricht */}
      <div>
        <label htmlFor="contact-message" className={labelCls}>
          Nachricht
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Was planst du?"
          className={[fieldBase, "resize-y", state.errors?.message ? fieldErrCls : ""].join(" ")}
        />
        {state.errors?.message && (
          <p className={errCls} role="alert">
            {state.errors.message}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Wird gesendet …" : "Absenden"}
        </Button>
      </div>
    </form>
  );
}

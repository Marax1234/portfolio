/**
 * SiteFooter — RSC
 *
 * Enthält: Kontakt (Mail-Platzhalter), Social-Links, Sitemap-Kurzversion,
 * getrennte Zeile mit Pflichtlinks (Impressum, Datenschutz) + Kooperationen.
 *
 * Konzept §3: „Impressum und Datenschutzerklärung gehören in den Footer,
 * nicht in die Hauptnavigation."
 *
 * Kein Hardcode (§0.2).
 */

import Link from "next/link";
import { NAV_LINKS, SOCIAL_LINKS, FOOTER_LEGAL } from "@/lib/navigation";

export default function SiteFooter() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="container-page py-12 md:py-16">
        {/* Hauptbereich: 3 Spalten auf Desktop, gestapelt auf Mobil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Spalte 1 — Name + Kurzpitch */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="type-label-caps text-on-surface hover:text-primary transition-colors"
            >
              Kilian Siebert
            </Link>
            <p className="type-body-md text-on-surface-variant mt-3 max-w-xs">
              Fotograf &amp; Videograf. Triathlon, Reisen, Menschen.
              Offen für Aufträge und Kooperationen.
            </p>
            {/* Kontakt */}
            <a
              href="mailto:mail@kilian-siebert.de"
              className="type-label-caps text-primary hover:text-primary-container transition-colors mt-4 inline-block"
            >
              mail@kilian-siebert.de
            </a>
          </div>

          {/* Spalte 2 — Sitemap */}
          <div>
            <p className="type-label-caps text-on-surface-variant mb-4">Seiten</p>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="type-body-md text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Spalte 3 — Social */}
          <div>
            <p className="type-label-caps text-on-surface-variant mb-4">Social</p>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="type-body-md text-on-surface-variant hover:text-on-surface transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trennlinie */}
        <div className="border-t border-outline-variant mt-10 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Copyright */}
            <p className="type-label-caps text-on-surface-variant">
              © {new Date().getFullYear()} Kilian Siebert
            </p>

            {/* Pflichtlinks + Kooperationen */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LEGAL.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="type-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

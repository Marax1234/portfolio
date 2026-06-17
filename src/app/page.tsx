/**
 * Startseite — Sprint 1 (Platzhalter)
 *
 * Minimale Landing-Page. Echte Startseite mit allen Modulen wird in Sprint 3
 * gebaut (§Sprint-Überblick).
 *
 * Verwendet ausschließlich Token-Utilities — kein Hardcode.
 */

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-surface">
      <div className="container-page text-center py-24">

        <p className="type-label-caps text-primary mb-6">
          Portfolio · Sprint 1
        </p>

        <h1 className="type-display-lg text-on-surface mb-8">
          Kilian Siebert
        </h1>

        <p className="type-body-lg text-on-surface-variant max-w-lg mx-auto mb-12">
          Fundament steht. Das Design-System ist geladen.{" "}
          Vollständige Startseite folgt in Sprint 3.
        </p>

        {/* Interner Link zur Styleguide-Seite */}
        <Link
          href="/styleguide"
          className="inline-flex items-center gap-2 type-label-caps text-on-primary bg-primary px-6 py-3 rounded-md hover:bg-primary-container transition-colors"
        >
          Design-System ansehen →
        </Link>

        <p className="type-label-caps text-outline-variant mt-16">
          Sprint 2: Navigation & globale Bausteine
        </p>

      </div>
    </main>
  );
}

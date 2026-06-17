"use client";

/**
 * SiteHeader — Sticky-Top-Navigation (Desktop)
 *
 * – Name links, NAV_LINKS rechts (type-label-caps)
 * – Schrumpft beim Scrollen: weniger vertikales Padding + Glass-Hintergrund
 * – Aktiver Link via usePathname
 * – Auf Mobil: nur Name sichtbar (Links → MobileBottomBar)
 * – prefers-reduced-motion: nur transition-colors, kein Sliding
 *
 * Kein Hardcode (§0.2): Styling ausschließlich über Tailwind-Utilities
 * und CSS-Variablen aus globals.css.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // useLayoutEffect statt useEffect: korrigiert den Scroll-Status synchron
  // vor dem ersten Browser-Paint. Initial-State bleibt bewusst `false`
  // (identisch zum SSR-Output), damit kein Hydration-Mismatch entsteht.
  useLayoutEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      // Scroll-Position ist beim SSR unbekannt (Browser kann die Seite
      // bereits gescrollt wiederherstellen, bevor React hydratisiert) —
      // dieser Style ist bewusst eine Client-only-Progressive-Enhancement,
      // kein Hydration-Bug. Daher hier gezielt suppressHydrationWarning.
      suppressHydrationWarning
      className={[
        "fixed top-0 inset-x-0 z-50",
        "transition-all motion-reduce:transition-none",
        scrolled
          ? "border-b border-outline-variant"
          : "border-b border-transparent",
      ].join(" ")}
      style={{
        backgroundColor: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? `blur(var(--glass-blur))` : "none",
        WebkitBackdropFilter: scrolled ? `blur(var(--glass-blur))` : "none",
      }}
    >
      <div
        className={[
          "container-page flex items-center justify-between",
          "transition-[padding] motion-reduce:transition-none",
          scrolled ? "py-3" : "py-5",
        ].join(" ")}
      >
        {/* Name / Logo */}
        <Link
          href="/"
          className="type-label-caps text-on-surface hover:text-primary transition-colors"
        >
          Kilian Siebert
        </Link>

        {/* Desktop-Links (versteckt auf Mobil) */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Hauptnavigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "type-label-caps transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

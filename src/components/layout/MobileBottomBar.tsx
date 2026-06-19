"use client";

/**
 * MobileBottomBar — fixe Leiste am unteren Rand (nur mobil, md:hidden)
 *
 * – 4 Einträge aus NAV_LINKS (Icon + kurzes Label)
 * – Aktiver Zustand via usePathname
 * – Glass-Hintergrund + Top-Border (border-tonal)
 * – Höhe: var(--bottombar-height)
 *
 * Kein Hardcode (§0.2).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/navigation";

/** Einfache SVG-Icons per Route (Outline-Style, token-färbbar via currentColor) */
function WorkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function AboutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function JournalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ContactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function KoopsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13.5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 16c0-2.5 2-4.5 4.5-4.5S11 13.5 11 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 14c.4-1.8 2-3 3.5-3s3.1 1.2 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<string, React.ComponentType> = {
  "/arbeiten":      WorkIcon,
  "/ueber":         AboutIcon,
  "/journal":       JournalIcon,
  "/kooperationen": KoopsIcon,
  "/kontakt":       ContactIcon,
};

export default function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-outline-variant"
      style={{
        height: "var(--bottombar-height)",
        backgroundColor: "var(--glass-bg)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
      }}
      aria-label="Mobile Navigation"
    >
      <ul className="flex h-full items-stretch">
        {NAV_LINKS.map(({ href, shortLabel, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const Icon = ICONS[href] ?? WorkIcon;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={[
                  "flex flex-col items-center justify-center h-full gap-1",
                  "transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon />
                <span
                  className="type-label-caps"
                  style={{ fontSize: "var(--bottombar-label-size)" }}
                >
                  {shortLabel ?? label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Zentrale Navigations-Konfiguration (Sprint 2)
 * Single Source of Truth für alle Link-Listen.
 * Header, MobileBottomBar und Footer lesen aus dieser Datei.
 *
 * Platzhalter-Routen (404 bis zur jeweiligen Sprint-Umsetzung):
 *   /arbeiten → Sprint 5 (datengetrieben, siehe src/app/(frontend)/arbeiten/)
 *   /ueber    → Sprint 5 (siehe src/app/(frontend)/ueber/)
 *   /journal  → Sprint 6
 *   /kontakt  → Sprint 9
 */

export interface NavLink {
  href: string;
  label: string;
  /** Kurzes Label für mobile Bottom-Bar (max ~8 Zeichen) */
  shortLabel?: string;
}

export interface SocialLink {
  href: string;
  label: string;
  platform: "instagram" | "tiktok" | "youtube";
}

/** Haupt-Navigation (Konzept §3) */
export const NAV_LINKS: NavLink[] = [
  { href: "/arbeiten",      label: "Arbeiten",       shortLabel: "Arbeiten" },
  { href: "/ueber",         label: "Über mich",      shortLabel: "Über" },
  { href: "/journal",       label: "Journal",        shortLabel: "Journal" },
  { href: "/kooperationen", label: "Kooperationen",  shortLabel: "Koops" },
  { href: "/kontakt",       label: "Kontakt",        shortLabel: "Kontakt" },
];

/** Social-Links (Platzhalter-href="#" bis Sprint 9/10) */
export const SOCIAL_LINKS: SocialLink[] = [
  { href: "#", label: "Instagram", platform: "instagram" },
  { href: "#", label: "TikTok",    platform: "tiktok" },
  { href: "#", label: "YouTube",   platform: "youtube" },
];

/** Footer-Pflichtlinks (DE-Recht) */
export const FOOTER_LEGAL: NavLink[] = [
  { href: "/impressum",   label: "Impressum" },   /* DE-Pflicht */
  { href: "/datenschutz", label: "Datenschutz" }, /* DE-Pflicht */
];

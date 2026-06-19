import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import MobileBottomBar from "@/components/layout/MobileBottomBar";

/**
 * Fonts — via next/font/google (kein externes CSS-Request, DSGVO-freundlich).
 * variable: Die CSS-Custom-Property, über die globals.css die Fonts einbindet.
 * Alle Gewichte aus design.md §typography eingeschlossen.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Root-Metadata (Sprint 10 — OG/Twitter/robots/icons).
 * Pro-Seiten-`metadata`/`generateMetadata` in den jeweiligen page.tsx
 * bleibt unverändert und überschreibt diese Basis-Defaults.
 *
 * `metadataBase` → absolute URL für OG-Bilder und hreflang.
 * OG-Bild: /public/og-default.jpg — Platzhalter bis Deployment
 * (echtes Asset: Kilian-Portrait oder Hero-Still, ca. 1200×630 px).
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Kilian Siebert — Portfolio",
    template: "%s — Kilian Siebert",
  },
  description:
    "Fotograf & Videograf aus Hamburg. Triathlon, Reisen, Hochzeiten, Commercial.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Kilian Siebert",
    title: "Kilian Siebert — Portfolio",
    description:
      "Fotograf & Videograf aus Hamburg. Triathlon, Reisen, Hochzeiten, Commercial.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kilian Siebert — Portfolio",
    description:
      "Fotograf & Videograf aus Hamburg. Triathlon, Reisen, Hochzeiten, Commercial.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${newsreader.variable} ${inter.variable} h-full`}
    >
      {/*
       * bg-surface / text-on-surface: Tailwind-Utilities aus @theme inline
       * → greifen auf var(--color-surface) / var(--color-on-surface) zurück.
       * Kein Hardcode.
       */}
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        {/*
         * Skip-Link (Sprint 10, A11y): sichtbar nur bei Tastaturfokus,
         * springt direkt zum Hauptinhalt — screen-reader- und keyboard-freundlich.
         */}
        <a href="#main" className="skip-link">
          Zum Inhalt springen
        </a>

        {/*
         * Globale Chrome (Sprint 2):
         * SiteHeader  — Sticky-Top-Nav (Desktop)
         * main        — pt-header = Abstand unter Header, pb-bottombar = Abstand über Bottom-Bar (Mobil)
         * SiteFooter  — wird durch flex-1 auf main nach unten gedrückt
         * MobileBottomBar — fix, nur Mobil (md:hidden)
         *
         * Sprint 10: main erhält id="main" + tabIndex={-1} als Skip-Link-Ziel.
         * tabIndex={-1} macht das Element per JS fokussierbar, ohne es in die
         * Tab-Reihenfolge aufzunehmen (Screen-Reader-Standard).
         */}
        <SiteHeader />
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 pt-header pb-bottombar md:pb-0 outline-none"
        >
          {children}
        </main>
        <SiteFooter />
        <MobileBottomBar />

        {/*
         * Umami cookieloses Tracking (Sprint 10 — app-seitige Schnittstelle).
         * Script wird nur eingebunden, wenn beide NEXT_PUBLIC_UMAMI_*-Vars gesetzt
         * sind → in Dev/ohne Deployment vollständig inert. Kein Cookie-Banner nötig
         * (Umami ist per Default cookielos, tech-stack §2.10).
         */}
        {process.env.NEXT_PUBLIC_UMAMI_SRC &&
          process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
            <Script
              src={process.env.NEXT_PUBLIC_UMAMI_SRC}
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              strategy="afterInteractive"
              defer
            />
          )}
      </body>
    </html>
  );
}

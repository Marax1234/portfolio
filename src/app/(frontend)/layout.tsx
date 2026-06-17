import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Kilian Siebert — Portfolio",
  description: "Portfolio von Kilian Siebert — Fotografie, Video, Editorial.",
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
         * Globale Chrome (Sprint 2):
         * SiteHeader  — Sticky-Top-Nav (Desktop)
         * main        — pt-header = Abstand unter Header, pb-bottombar = Abstand über Bottom-Bar (Mobil)
         * SiteFooter  — wird durch flex-1 auf main nach unten gedrückt
         * MobileBottomBar — fix, nur Mobil (md:hidden)
         */}
        <SiteHeader />
        <main className="flex-1 pt-header pb-bottombar md:pb-0">
          {children}
        </main>
        <SiteFooter />
        <MobileBottomBar />
      </body>
    </html>
  );
}

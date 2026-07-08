import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
// ORDER: theme.css first (source of truth), then globals.css (Tailwind + resets),
// then page-specific CSS.
import "./theme.css";
import "./globals.css";
import "./home.css";
import "./multi-color.css";
import "./services.css";
import "./home-overrides.css";
// Imported LAST so the standardized stat pattern has the highest priority.
import "./stat-pattern.css";
// Homepage redesign — overrides old section styles with orange/navy theme.
import "./home-redesign.css";

import AlertBar from "../components/AlertBar";
import Navigation from "../components/Navigation";
import ClientScripts from "./ClientScripts";
import ChatWidget from "../components/ChatWidget";
import MaintenanceGuard from "../components/MaintenanceGuard";
import FaviconInjector from "../components/FaviconInjector";

// Body copy -> Inter (400 regular / 600 buttons)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Headings / nav / brand / stat numbers -> Plus Jakarta Sans (bold 700-800)
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const siteUrl = "https://digisharks-communications.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "DigiSharks Communications",
  description:
    "Top Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative strategies.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    url: siteUrl,
    type: "website",
    title: "DigiSharks Communications",
    description:
      "Top Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative strategies.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@digisharks",
    title: "DigiSharks Communications",
    description:
      "Top Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative strategies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${plusJakarta.variable} antialiased`}
      >
        <Script
          id="js-ready-check"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `if (!document.documentElement.classList.contains("js-ready")) document.documentElement.classList.add("js-ready");`,
          }}
        />
        <MaintenanceGuard>
          <AlertBar />
          <Navigation />
          {children}
          <ChatWidget />
        </MaintenanceGuard>
        <ClientScripts />
        <FaviconInjector />
      </body>
    </html>
  );
}

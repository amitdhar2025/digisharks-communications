import type { Metadata } from "next";
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
import CartProviderShell from "../components/CartProvider";
import { WishlistProvider } from "../lib/wishlist-context";
import StaleBundleDetector from "./StaleBundleDetector";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digisharkscommunications.com/";

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
        {/* ── Force browser to NEVER cache HTML (prevents old JS bundle hydration errors) ── */}
        <meta httpEquiv="cache-control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="pragma" content="no-cache" />
        <meta httpEquiv="expires" content="0" />

        {/* ── Preconnect to external origins for faster LCP ── */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── Preload above-the-fold assets ── */}
        <link rel="preload" href="/darks.avif" as="image" />

        {/* ── Build version meta tag for stale-bundle detection ── */}
        <meta name="build-time" content={process.env.NEXT_PUBLIC_BUILD_TIME || ''} />

        {/* ── Inline script: stamps the build time on window so the
              StaleBundleDetector component can compare it with the
              compiled-in value and force-reload if the JS bundle is stale. ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BUILD_TIME=${JSON.stringify(process.env.NEXT_PUBLIC_BUILD_TIME || '')}`
          }}
        />

        {/* ── Inline critical CSS for first paint ── */}
        <style>{`
          /* Critical above-the-fold styles */
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          html{font-size:16px;-webkit-text-size-adjust:100%}
          body{background:#F8F9FB;color:#4A5568;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,Helvetica Neue,Helvetica,sans-serif;font-size:16px;line-height:1.65;min-height:100vh;overflow-x:hidden}
          .hero-section{position:relative;padding:clamp(1.5rem,3vw,3rem) 5%}
          .hero-inner{max-width:1200px;margin:0 auto}
          .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center}
          .hero-copy h1{font-size:clamp(2rem,4.5vw,3.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;color:#0F1628;margin-bottom:1rem}
          .orange-text{color:#FF5B2E}
          .section-label-orange{display:inline-flex;align-items:center;gap:8px;background:rgba(255,91,46,0.1);color:#FF5B2E;padding:6px 14px;border-radius:50px;font-size:.8125rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:1rem}
          .label-dot{width:6px;height:6px;border-radius:50%;background:#FF5B2E}
          .fade-up{opacity:0;transform:translateY(20px);animation:fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) forwards}
          .stagger-1{animation-delay:0.1s}.stagger-2{animation-delay:0.18s}.stagger-3{animation-delay:0.26s}.stagger-4{animation-delay:0.34s}
          @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
          .hero-ctas{display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap}
          .btn-primary,.btn-secondary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;border-radius:8px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .3s;text-decoration:none}
          .btn-primary{background:linear-gradient(135deg,#06B6D4,#6366F1 60%,#EC4899);color:#05060d;border:none}
          .btn-secondary{background:transparent;color:#0F1628;border:1.5px solid #E5E7EB}
          .stats-row{display:flex;gap:2rem;margin-top:2rem;flex-wrap:wrap}
          .stat-item{display:flex;flex-direction:column;gap:2px}
          .stat-num{font-size:clamp(1.75rem,2.5vw,2.25rem);font-weight:800;color:#0F1628;line-height:1.1}
          .stat-label{font-size:.8125rem;font-weight:500;color:#6B7280}
          @media(max-width:768px){.hero-grid{grid-template-columns:1fr}.hero-ctas{flex-direction:column}.stats-row{gap:1.5rem;justify-content:space-between}}
          .seo-audit-promo-section{display:none}@media(min-width:768px){.seo-audit-promo-section{display:block}}
          #navbar{display:flex;align-items:center;justify-content:space-between;padding:.75rem 5%;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(0,0,0,0.06)}
          .nav-logo{display:flex;align-items:center;text-decoration:none}
        `}</style>
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${plusJakarta.variable} antialiased`}
      >
        <MaintenanceGuard>
          <WishlistProvider>
            <CartProviderShell>
              <AlertBar />
              <Navigation />
              {children}
              <ChatWidget />
              <StaleBundleDetector />
            </CartProviderShell>
          </WishlistProvider>
        </MaintenanceGuard>
        <ClientScripts />
        <FaviconInjector />
      </body>
    </html>
  );
}

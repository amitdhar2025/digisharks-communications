import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import "./home.css";
import AlertBar from "../components/AlertBar";
import Navigation from "../components/Navigation";
import ClientScripts from "./ClientScripts";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `if (!document.documentElement.classList.contains("js-ready")) document.documentElement.classList.add("js-ready");`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
className={`${dmSans.variable} ${syne.variable} antialiased`}
      >
        <AlertBar />
        <Navigation />
        {children}
        <ClientScripts />
      </body>
    </html>
  );
}
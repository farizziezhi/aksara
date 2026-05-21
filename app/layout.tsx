import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const runde = Inter({
  variable: "--font-runde",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
});

const SITE_URL = "https://aksara-ivory-theta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aksara — Open Access Journal Search",
    template: "%s · Aksara",
  },
  description:
    "Pencarian terpadu paper open-access dari OpenAlex, CORE, arXiv, DOAJ, Crossref, dan Europe PMC. Bersih, cepat, gratis.",
  keywords: [
    "open access",
    "journal search",
    "paper search",
    "OpenAlex",
    "DOAJ",
    "arXiv",
    "Europe PMC",
    "Crossref",
  ],
  authors: [{ name: "Farizzi Ezhi" }],
  creator: "Farizzi Ezhi",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    title: "Aksara — Open Access Journal Search",
    description:
      "Pencarian terpadu paper open-access lintas 6 sumber data ilmiah.",
    siteName: "Aksara",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aksara — Open Access Journal Search",
    description:
      "Pencarian terpadu paper open-access lintas 6 sumber data ilmiah.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${runde.variable} ${caveat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-canvas-white text-ink-black">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

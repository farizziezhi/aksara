import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Open Access Journal Search",
  description:
    "Cari paper open-access dari OpenAlex, CORE, arXiv, DOAJ, Crossref, Europe PMC, dan Unpaywall.",
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
      </body>
    </html>
  );
}

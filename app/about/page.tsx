import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Aksara adalah pencarian terpadu paper open-access dari 6 sumber data ilmiah. Dibuat oleh Farizzi Ezhi.",
};

const SOURCES = [
  { name: "OpenAlex", desc: "240+ juta karya ilmiah, metadata kaya, citation graph." },
  { name: "CORE", desc: "Aggregator OA terbesar, full-text dari ribuan repositori." },
  { name: "arXiv", desc: "Preprint physics, math, CS, quantitative biology." },
  { name: "DOAJ", desc: "Directory of Open Access Journals, kurasi ketat." },
  { name: "Crossref", desc: "Metadata DOI + citation count komprehensif." },
  { name: "Europe PMC", desc: "Life sciences + biomedical, full-text OA." },
  { name: "PubMed", desc: "NCBI, kedokteran + biomedical, 36+ juta abstrak." },
  { name: "Unpaywall", desc: "OA link lookup berdasarkan DOI." },
  { name: "OpenCitations", desc: "Enrichment citation count via DOI." },
];

const STACK = [
  "Next.js 16 + React 19",
  "TypeScript",
  "Prisma 7 + libSQL adapter",
  "Turso (libSQL serverless)",
  "Tailwind CSS v4",
  "SQLite FTS5 untuk related papers",
  "Vercel hosting",
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-caveat text-[24px] text-sky-teal">tentang proyek</p>
          <h1 className="mt-3 text-heading-lg font-semibold tracking-tight text-ink-black md:text-display">
            Penelusuran ilmiah, tanpa biaya.
          </h1>
          <p className="mt-6 text-body text-deep-slate">
            Aksara menggabungkan beberapa sumber data ilmiah open-access ke dalam
            satu pencarian. Hasil di-deduplikasi, dirangking, dan di-cache 24 jam
            agar pencarian berikutnya lebih cepat.
          </p>
        </header>

        <section className="mt-20">
          <h2 className="text-subheading font-semibold text-ink-black">
            Sumber data
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOURCES.map((s) => (
              <div
                key={s.name}
                className="rounded-card bg-canvas-white p-5 shadow-[var(--shadow-subtle)]"
              >
                <p className="text-body font-semibold text-ink-black">{s.name}</p>
                <p className="mt-2 text-body-sm text-deep-slate">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-subheading font-semibold text-ink-black">
            Tech stack
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {STACK.map((s) => (
              <li
                key={s}
                className="rounded-pill border border-hairline bg-canvas-white px-4 py-2 text-body-sm text-graphite"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <h2 className="text-subheading font-semibold text-ink-black">
            Pembuat
          </h2>
          <div className="mt-6 rounded-card bg-subtle-cream p-8">
            <p className="font-caveat text-[24px] text-graphite">
              dibuat dengan rasa ingin tahu
            </p>
            <p className="mt-3 text-body text-deep-slate">
              Aksara dibangun oleh{" "}
              <span className="font-semibold text-ink-black">Farizzi Ezhi</span>
              {" "}sebagai eksperimen pencarian terpadu untuk literatur akademik
              open-access.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://github.com/farizziezhi/aksara"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-pill bg-button-black px-[14px] py-[6px] text-body-sm text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90"
              >
                Source code
              </a>
              <Link
                href="/"
                className="inline-flex items-center rounded-pill border border-hairline bg-canvas-white px-[14px] py-[6px] text-body-sm text-ink-black transition hover:border-ink-black"
              >
                Mulai cari
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

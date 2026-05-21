import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-hairline bg-canvas-white">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-body-sm text-deep-slate">
            Pencarian terpadu paper open-access dari 6 sumber data ilmiah.
            Bersih, cepat, gratis.
          </p>
          <p className="mt-4 font-caveat text-[20px] text-graphite">
            built for curious minds.
          </p>
        </div>

        <div>
          <p className="text-caption uppercase tracking-[0.08em] text-ash-gray">
            Navigasi
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/" className="text-body-sm text-graphite hover:text-ink-black">
                Cari
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-body-sm text-graphite hover:text-ink-black">
                Tentang
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/farizziezhi/aksara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-graphite hover:text-ink-black"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-caption uppercase tracking-[0.08em] text-ash-gray">
            Sumber data
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-body-sm text-graphite">
            <li>OpenAlex</li>
            <li>CORE</li>
            <li>arXiv</li>
            <li>DOAJ</li>
            <li>Crossref</li>
            <li>Europe PMC</li>
            <li>PubMed</li>
            <li>Unpaywall</li>
            <li>OpenCitations</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-4 py-6 sm:px-6 md:flex-row">
          <p className="text-caption text-ash-gray">
            © {year} Aksara · Cache 24 jam · Rate limit 30/menit per IP
          </p>
          <p className="text-caption text-ash-gray">
            Dibuat oleh{" "}
            <a
              href="https://github.com/farizziezhi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-black hover:text-sky-teal"
            >
              Farizzi Ezhi
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

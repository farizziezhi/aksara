import type { PaperResult } from "../types/paper";
import { CitationMenu } from "./CitationMenu";
import { RelatedPapers } from "./RelatedPapers";

interface Props {
  paper: PaperResult;
}

export function ResultCard({ paper }: Props) {
  const authors = paper.authors.length
    ? paper.authors.slice(0, 5).join(", ") +
      (paper.authors.length > 5 ? `, +${paper.authors.length - 5}` : "")
    : "Penulis tidak diketahui";

  return (
    <article className="rounded-card bg-canvas-white p-6 shadow-[var(--shadow-subtle)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-subheading font-semibold leading-snug text-ink-black">
          {paper.title}
        </h2>
        <span className="shrink-0 rounded-pill bg-subtle-cream px-3 py-1 text-caption font-medium text-graphite">
          {paper.source}
        </span>
      </header>

      <p className="mb-4 text-body-sm text-deep-slate">
        <span className="text-graphite">{authors}</span>
        {paper.year ? <span className="text-ash-gray"> · {paper.year}</span> : null}
        {paper.citation_count ? (
          <span className="text-ash-gray">
            {" "}
            · {paper.citation_count.toLocaleString("id-ID")} sitasi
          </span>
        ) : null}
      </p>

      {paper.abstract ? (
        <p className="mb-6 line-clamp-3 text-body-sm text-deep-slate">
          {paper.abstract}
        </p>
      ) : (
        <p className="mb-6 font-caveat text-[16px] text-ash-gray">
          Abstrak tidak tersedia.
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-3">
        {paper.pdf_url ? (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-pill bg-button-black px-[14px] py-[6px] text-body-sm font-medium text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90"
          >
            Buka PDF
          </a>
        ) : null}
        {paper.doi ? (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm text-sky-teal underline-offset-2 hover:underline"
          >
            DOI: {paper.doi}
          </a>
        ) : null}
        {paper.is_open_access ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-canvas-white px-3 py-1 text-caption text-graphite">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 text-sky-teal"
            >
              <path d="M4 10l4 4 8-8" />
            </svg>
            Open Access
          </span>
        ) : null}
        <span className="ml-auto">
          <CitationMenu paper={paper} />
        </span>
      </footer>
      <RelatedPapers paperId={paper.id} />
    </article>
  );
}

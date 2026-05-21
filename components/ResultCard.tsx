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
    <article className="rounded-card bg-canvas-white p-4 shadow-[var(--shadow-subtle)] transition sm:p-6 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2 sm:mb-4 sm:gap-3">
        <h2 className="min-w-0 flex-1 text-[17px] font-semibold leading-snug tracking-tight text-ink-black sm:text-subheading">
          <span className="break-words">{paper.title}</span>
        </h2>
        <span className="shrink-0 rounded-pill bg-subtle-cream px-2.5 py-0.5 text-[11px] font-medium text-graphite sm:px-3 sm:py-1 sm:text-caption">
          {paper.source}
        </span>
      </header>

      <p className="mb-3 break-words text-[13px] text-deep-slate sm:mb-4 sm:text-body-sm">
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
        <p className="mb-5 line-clamp-3 break-words text-[13px] text-deep-slate sm:mb-6 sm:text-body-sm">
          {paper.abstract}
        </p>
      ) : (
        <p className="mb-5 font-caveat text-[15px] text-ash-gray sm:mb-6 sm:text-[16px]">
          Abstrak tidak tersedia.
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-2 sm:gap-3">
        {paper.pdf_url ? (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-pill bg-button-black px-3.5 py-1.5 text-[13px] font-medium text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90 sm:text-body-sm"
          >
            Buka PDF
          </a>
        ) : null}
        {paper.is_open_access ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-canvas-white px-2.5 py-0.5 text-[11px] text-graphite sm:px-3 sm:py-1 sm:text-caption">
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
            OA
          </span>
        ) : null}
        {paper.doi ? (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[60vw] truncate text-[12px] text-sky-teal underline-offset-2 hover:underline sm:max-w-none sm:text-body-sm"
            title={paper.doi}
          >
            DOI: {paper.doi}
          </a>
        ) : null}
        <span className="ml-auto">
          <CitationMenu paper={paper} />
        </span>
      </footer>
      <RelatedPapers paperId={paper.id} />
    </article>
  );
}

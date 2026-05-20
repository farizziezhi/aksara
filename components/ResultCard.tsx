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
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-snug">
          {paper.title}
        </h2>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {paper.source}
        </span>
      </header>

      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        {authors}
        {paper.year ? ` · ${paper.year}` : ""}
        {paper.citation_count
          ? ` · ${paper.citation_count.toLocaleString("id-ID")} sitasi`
          : ""}
      </p>

      {paper.abstract ? (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {paper.abstract}
        </p>
      ) : (
        <p className="mb-4 text-sm italic text-zinc-400">
          Abstrak tidak tersedia.
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-3 text-sm">
        {paper.pdf_url ? (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Buka PDF
          </a>
        ) : null}
        {paper.doi ? (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            DOI: {paper.doi}
          </a>
        ) : null}
        {paper.is_open_access ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            Open Access
          </span>
        ) : null}
        <CitationMenu paper={paper} />
      </footer>
      <RelatedPapers paperId={paper.id} />
    </article>
  );
}

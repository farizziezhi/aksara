"use client";

import { useEffect, useState } from "react";
import type { PaperResult } from "../types/paper";

interface Props {
  paperId: string;
}

export function RelatedPapers({ paperId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PaperResult[]>([]);

  useEffect(() => {
    if (!open || results.length > 0) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/related?id=${encodeURIComponent(paperId)}&limit=5`, {
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.message ?? `HTTP ${res.status}`);
        setResults(body.results ?? []);
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [open, paperId, results.length]);

  return (
    <div className="mt-4 border-t border-hairline pt-4 sm:mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[13px] text-sky-teal underline-offset-2 hover:underline sm:text-body-sm"
      >
        {open ? "Sembunyikan terkait" : "Lihat paper terkait"}
        <span aria-hidden className={open ? "rotate-180 transition" : "transition"}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 8l5 5 5-5" />
          </svg>
        </span>
      </button>
      {open ? (
        <div className="mt-3 rounded-card bg-subtle-cream p-4 sm:mt-4 sm:p-5">
          {loading ? (
            <p className="text-[13px] text-ash-gray sm:text-body-sm">Memuat paper terkait...</p>
          ) : null}
          {error ? <p className="text-[13px] text-hot-pink sm:text-body-sm">{error}</p> : null}
          {!loading && !error && results.length === 0 ? (
            <p className="text-[13px] text-ash-gray sm:text-body-sm">
              Belum ada paper terkait di cache.
            </p>
          ) : null}
          <ul className="space-y-3">
            {results.map((p) => (
              <li key={p.id} className="flex flex-col gap-1.5 text-[13px] sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2 sm:text-body-sm">
                <span className="self-start rounded-pill bg-canvas-white px-2 py-0.5 text-[11px] text-graphite sm:px-2.5 sm:text-caption">
                  {p.source}
                </span>
                {p.doi ? (
                  <a
                    href={`https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-graphite hover:text-sky-teal hover:underline"
                  >
                    {p.title}
                  </a>
                ) : p.pdf_url ? (
                  <a
                    href={p.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-graphite hover:text-sky-teal hover:underline"
                  >
                    {p.title}
                  </a>
                ) : (
                  <span className="break-words text-graphite">{p.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

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
    <div className="mt-5 border-t border-hairline pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-body-sm text-sky-teal underline-offset-2 hover:underline"
      >
        {open ? "Sembunyikan terkait" : "Lihat paper terkait"}
      </button>
      {open ? (
        <div className="mt-4 rounded-card bg-subtle-cream p-5">
          {loading ? (
            <p className="text-body-sm text-ash-gray">Memuat paper terkait...</p>
          ) : null}
          {error ? <p className="text-body-sm text-hot-pink">{error}</p> : null}
          {!loading && !error && results.length === 0 ? (
            <p className="text-body-sm text-ash-gray">
              Belum ada paper terkait di cache.
            </p>
          ) : null}
          <ul className="space-y-3">
            {results.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline gap-2 text-body-sm">
                <span className="rounded-pill bg-canvas-white px-2.5 py-0.5 text-caption text-graphite">
                  {p.source}
                </span>
                {p.doi ? (
                  <a
                    href={`https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-graphite hover:text-sky-teal hover:underline"
                  >
                    {p.title}
                  </a>
                ) : p.pdf_url ? (
                  <a
                    href={p.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-graphite hover:text-sky-teal hover:underline"
                  >
                    {p.title}
                  </a>
                ) : (
                  <span className="text-graphite">{p.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

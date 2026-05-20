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
    <div className="w-full pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
      >
        {open ? "Sembunyikan terkait" : "Lihat paper terkait"}
      </button>
      {open ? (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          {loading ? (
            <p className="text-sm text-zinc-500">Memuat paper terkait...</p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!loading && !error && results.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada paper terkait di cache.</p>
          ) : null}
          <ul className="space-y-2">
            {results.map((p) => (
              <li key={p.id} className="text-sm">
                <span className="mr-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                  {p.source}
                </span>
                {p.doi ? (
                  <a
                    href={`https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {p.title}
                  </a>
                ) : p.pdf_url ? (
                  <a
                    href={p.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {p.title}
                  </a>
                ) : (
                  <span>{p.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

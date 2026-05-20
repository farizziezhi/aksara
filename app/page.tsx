"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ResultCard } from "../components/ResultCard";
import { FilterPanel, type Filters } from "../components/FilterPanel";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { Pagination } from "../components/Pagination";
import type {
  SearchErrorResponse,
  SearchSuccessResponse,
} from "../types/api";

type Status = "idle" | "loading" | "success" | "error";

const PAGE_SIZE = 10;

export default function Home() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ oa_only: true });
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<SearchSuccessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const runSearch = useCallback(
    async (q: string, p: number, f: Filters, signal: AbortSignal) => {
      const params = new URLSearchParams({
        q,
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      if (f.year !== undefined) params.set("year", String(f.year));
      if (f.source) params.set("source", f.source.toLowerCase());
      params.set("oa_only", String(f.oa_only));

      setStatus("loading");
      setErrorMessage("");

      try {
        const res = await fetch(`/api/search?${params.toString()}`, { signal });
        const body = (await res.json()) as
          | SearchSuccessResponse
          | SearchErrorResponse;

        if (!res.ok || "error" in body) {
          const msg =
            "error" in body ? body.message : `HTTP ${res.status}`;
          setStatus("error");
          setErrorMessage(msg);
          setData(null);
          return;
        }

        setData(body);
        setStatus("success");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setErrorMessage((err as Error).message);
      }
    },
    [],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setStatus("idle");
      setData(null);
      return;
    }
    const ctrl = new AbortController();
    runSearch(trimmed, page, filters, ctrl.signal);
    return () => ctrl.abort();
  }, [query, page, filters, runSearch]);

  const onQueryChange = useCallback((q: string) => {
    setQuery(q);
    setPage(1);
  }, []);

  const onFiltersChange = useCallback((next: Filters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const onRetry = useCallback(() => {
    setQuery((q) => q + "");
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Open Access Journal Search
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Pencarian terpadu dari OpenAlex, CORE, arXiv, dan DOAJ.
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[260px_1fr]">
        <div className="md:order-2">
          <SearchBar onChange={onQueryChange} />

          <section className="mt-6">
            {status === "idle" ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                Ketik 3 karakter atau lebih untuk mulai mencari.
              </p>
            ) : status === "loading" ? (
              <LoadingState />
            ) : status === "error" ? (
              <ErrorState message={errorMessage} onRetry={onRetry} />
            ) : data && data.results.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                Tidak ada hasil untuk &ldquo;{data.query}&rdquo;. Coba kata kunci lain.
              </p>
            ) : data ? (
              <>
                <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
                  {data.total.toLocaleString("id-ID")} hasil
                  {data.from_cache ? " (dari cache)" : ""}
                  {data.sources_failed.length > 0
                    ? ` · sumber gagal: ${data.sources_failed.join(", ")}`
                    : ""}
                </p>
                {data.warning ? (
                  <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                    {data.warning}
                  </p>
                ) : null}
                <div className="flex flex-col gap-4">
                  {data.results.map((p) => (
                    <ResultCard key={p.id} paper={p} />
                  ))}
                </div>
                <Pagination
                  page={data.page}
                  limit={data.limit}
                  total={data.total}
                  onChange={setPage}
                />
              </>
            ) : null}
          </section>
        </div>

        <div className="md:order-1">
          <FilterPanel filters={filters} onChange={onFiltersChange} />
        </div>
      </main>

      <footer className="mt-10 border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Hasil di-cache 24 jam. Rate limit: 30 permintaan/menit per IP.
      </footer>
    </div>
  );
}

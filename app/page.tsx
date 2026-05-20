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

const FEATURES = [
  "6 sumber digabung",
  "Cache 24 jam",
  "Open access prioritas",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ oa_only: true, sort: "relevance" });
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
      if (f.year_min !== undefined) params.set("year_min", String(f.year_min));
      if (f.year_max !== undefined) params.set("year_max", String(f.year_max));
      if (f.author) params.set("author", f.author);
      if (f.source) params.set("source", f.source.toLowerCase());
      params.set("oa_only", String(f.oa_only));
      params.set("sort", f.sort);

      setStatus("loading");
      setErrorMessage("");

      try {
        const res = await fetch(`/api/search?${params.toString()}`, { signal });
        const body = (await res.json()) as
          | SearchSuccessResponse
          | SearchErrorResponse;

        if (!res.ok || "error" in body) {
          const msg = "error" in body ? body.message : `HTTP ${res.status}`;
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
      <header className="border-b border-hairline bg-canvas-white">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 px-6 py-5">
          <div className="flex items-center gap-2">
            <span aria-hidden className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-button-black">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-teal" />
            </span>
            <span className="text-body font-semibold text-ink-black">
              OAJournals
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a className="text-body-sm text-ink-black" href="#">
              Cari
            </a>
            <a className="text-body-sm text-ash-gray hover:text-ink-black" href="#sumber">
              Sumber
            </a>
            <a className="text-body-sm text-ash-gray hover:text-ink-black" href="#tentang">
              Tentang
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a className="hidden text-body-sm text-ash-gray hover:text-ink-black sm:inline" href="#tentang">
              Pelajari
            </a>
            <a
              href="#cari"
              className="rounded-pill bg-button-black px-[14px] py-[6px] text-body-sm text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90"
            >
              Mulai cari
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-hairline bg-canvas-white">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-20 text-center">
          <p className="font-caveat text-[24px] text-sky-teal">
            ribuan paper, satu pencarian
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-heading-lg font-semibold text-ink-black md:text-display">
            Cari paper open-access seperti seorang peneliti.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-body text-deep-slate">
            Penelusuran terpadu lintas OpenAlex, CORE, arXiv, DOAJ, Crossref, dan Europe PMC.
            Bersih, ringan, tanpa biaya.
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="inline-flex items-center gap-2 text-body-sm text-graphite">
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-sky-teal"
                >
                  <path d="M4 10l4 4 8-8" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main id="cari" className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <SearchBar onChange={onQueryChange} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]">
          <div className="md:order-1">
            <FilterPanel filters={filters} onChange={onFiltersChange} />
          </div>

          <section className="md:order-2">
            {status === "idle" ? (
              <div className="rounded-card border border-dashed border-hairline bg-subtle-cream py-20 text-center">
                <p className="text-body text-ash-gray">
                  Ketik 3 karakter atau lebih untuk mulai mencari.
                </p>
              </div>
            ) : status === "loading" ? (
              <LoadingState />
            ) : status === "error" ? (
              <ErrorState message={errorMessage} onRetry={onRetry} />
            ) : data && data.results.length === 0 ? (
              <div className="rounded-card border border-dashed border-hairline bg-subtle-cream py-20 text-center">
                <p className="text-body text-ash-gray">
                  Tidak ada hasil untuk &ldquo;{data.query}&rdquo;. Coba kata kunci lain.
                </p>
              </div>
            ) : data ? (
              <>
                <div className="mb-6 flex flex-wrap items-baseline gap-3">
                  <p className="text-subheading font-semibold text-ink-black">
                    {data.total.toLocaleString("id-ID")}
                    <span className="ml-2 text-body-sm font-normal text-ash-gray">
                      hasil
                      {data.from_cache ? " · dari cache" : ""}
                    </span>
                  </p>
                  {data.sources_failed.length > 0 ? (
                    <p className="text-caption text-ash-gray">
                      sumber gagal: {data.sources_failed.join(", ")}
                    </p>
                  ) : null}
                </div>
                {data.warning ? (
                  <p className="mb-6 rounded-card border border-hairline bg-subtle-cream px-5 py-3 text-body-sm text-graphite">
                    {data.warning}
                  </p>
                ) : null}
                <div className="flex flex-col gap-5">
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
      </main>

      <footer className="border-t border-hairline bg-canvas-white">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-10 text-center">
          <p className="font-caveat text-[24px] text-graphite">
            built for curious minds.
          </p>
          <p className="mt-3 text-caption text-ash-gray">
            Hasil di-cache 24 jam. Rate limit 30 permintaan per menit per IP.
          </p>
        </div>
      </footer>
    </div>
  );
}

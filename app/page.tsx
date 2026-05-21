"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ResultCard } from "../components/ResultCard";
import { FilterPanel, type Filters } from "../components/FilterPanel";
import { ErrorState } from "../components/ErrorState";
import { Pagination } from "../components/Pagination";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ResultSkeletonList } from "../components/ResultSkeleton";
import { EmptyState } from "../components/EmptyState";
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
  const searchRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      <SiteHeader />

      <section className="border-b border-hairline bg-canvas-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="font-caveat text-[20px] text-sky-teal sm:text-[24px]">
            ribuan paper, satu pencarian
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-[34px] font-semibold leading-[1.1] tracking-tight text-ink-black sm:text-heading-lg md:text-display">
            Cari paper open-access seperti seorang peneliti.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-body-sm text-deep-slate sm:text-body">
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

      <main id="cari" className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <SearchBar onChange={onQueryChange} inputRef={searchRef} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] md:gap-10">
          <div className="md:order-1">
            <FilterPanel filters={filters} onChange={onFiltersChange} />
          </div>

          <section className="md:order-2">
            {status === "idle" ? (
              <EmptyState
                illustration="search"
                title="siap mencari"
                body="Ketik 3 karakter atau lebih untuk mulai. Tekan Cmd/Ctrl + K untuk fokus ke pencarian dengan cepat."
              />
            ) : status === "loading" ? (
              <ResultSkeletonList count={5} />
            ) : status === "error" ? (
              <ErrorState message={errorMessage} onRetry={onRetry} />
            ) : data && data.results.length === 0 ? (
              <EmptyState
                illustration="empty"
                title="belum ketemu"
                body={
                  <>
                    Tidak ada hasil untuk &ldquo;{data.query}&rdquo;.
                    Coba kata kunci lain atau longgarkan filter.
                  </>
                }
              />
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

      <SiteFooter />
    </div>
  );
}

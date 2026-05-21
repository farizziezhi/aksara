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
  "7 sumber digabung",
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
        <div className="mx-auto w-full max-w-[1200px] px-4 py-12 text-center sm:px-6 sm:py-20">
          <p className="font-caveat text-[18px] text-sky-teal sm:text-[24px]">
            ribuan paper, satu pencarian
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-[28px] font-semibold leading-[1.1] tracking-tight text-ink-black sm:mt-4 sm:text-heading-lg md:text-display">
            Cari paper open-access seperti seorang peneliti.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[14px] text-deep-slate sm:mt-6 sm:text-body">
            Penelusuran terpadu lintas OpenAlex, CORE, arXiv, DOAJ, Crossref, Europe PMC, dan PubMed.
            Bersih, ringan, tanpa biaya.
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:mt-8 sm:gap-x-6 sm:gap-y-3">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="inline-flex items-center gap-2 text-[12px] text-graphite sm:text-body-sm"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5 text-sky-teal sm:h-4 sm:w-4"
                >
                  <path d="M4 10l4 4 8-8" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main id="cari" className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <SearchBar onChange={onQueryChange} inputRef={searchRef} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-[280px_1fr] md:gap-10">
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
                <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mb-6">
                  <p className="text-[18px] font-semibold text-ink-black sm:text-subheading">
                    {data.total.toLocaleString("id-ID")}
                    <span className="ml-2 text-[12px] font-normal text-ash-gray sm:text-body-sm">
                      hasil
                      {data.from_cache ? " · cache" : ""}
                    </span>
                  </p>
                  {data.sources_failed.length > 0 ? (
                    <p className="text-[11px] text-ash-gray sm:text-caption">
                      gagal: {data.sources_failed.join(", ")}
                    </p>
                  ) : null}
                </div>
                {data.warning ? (
                  <p className="mb-5 rounded-card border border-hairline bg-subtle-cream px-4 py-2.5 text-[13px] text-graphite sm:mb-6 sm:px-5 sm:py-3 sm:text-body-sm">
                    {data.warning}
                  </p>
                ) : null}
                <div className="flex flex-col gap-4 sm:gap-5">
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

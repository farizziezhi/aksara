"use client";

import type { SourceName } from "../types/paper";
import { SOURCE_NAMES } from "../types/paper";

export type SearchSort = "relevance" | "citations_desc" | "year_desc" | "year_asc";

export interface Filters {
  year_min?: number;
  year_max?: number;
  source?: SourceName;
  oa_only: boolean;
  author?: string;
  sort: SearchSort;
}

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
}

const ROUTE_SOURCES = SOURCE_NAMES.filter((s) => s !== "Unpaywall");

export function FilterPanel({ filters, onChange }: Props) {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Filter
      </h3>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <label
            htmlFor="filter-year-min"
            className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tahun dari
          </label>
          <input
            id="filter-year-min"
            type="number"
            min={1900}
            max={2100}
            inputMode="numeric"
            value={filters.year_min ?? ""}
            onChange={(e) => {
              const raw = e.target.value.trim();
              const next = raw ? Number(raw) : undefined;
              onChange({
                ...filters,
                year_min: Number.isFinite(next) ? next : undefined,
              });
            }}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
          />
        </div>
        <div>
          <label
            htmlFor="filter-year-max"
            className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tahun sampai
          </label>
          <input
            id="filter-year-max"
            type="number"
            min={1900}
            max={2100}
            inputMode="numeric"
            value={filters.year_max ?? ""}
            onChange={(e) => {
              const raw = e.target.value.trim();
              const next = raw ? Number(raw) : undefined;
              onChange({
                ...filters,
                year_max: Number.isFinite(next) ? next : undefined,
              });
            }}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="filter-author"
          className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          Penulis
        </label>
        <input
          id="filter-author"
          type="search"
          placeholder="Contoh: Smith"
          value={filters.author ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              author: e.target.value.trim() || undefined,
            })
          }
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="filter-source"
          className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          Sumber
        </label>
        <select
          id="filter-source"
          value={filters.source ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange({ ...filters, source: v ? (v as SourceName) : undefined });
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
        >
          <option value="">Semua sumber</option>
          {ROUTE_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="filter-sort"
          className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          Urutkan
        </label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as SearchSort })
          }
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
        >
          <option value="relevance">Relevansi</option>
          <option value="citations_desc">Sitasi terbanyak</option>
          <option value="year_desc">Tahun terbaru</option>
          <option value="year_asc">Tahun terlama</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.oa_only}
          onChange={(e) => onChange({ ...filters, oa_only: e.target.checked })}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600"
        />
        Hanya open access
      </label>
    </aside>
  );
}

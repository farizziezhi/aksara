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

const fieldLabel = "block text-caption uppercase tracking-[0.08em] text-ash-gray mb-2";
const fieldInput =
  "w-full rounded-pill border border-hairline bg-canvas-white px-4 py-2 text-body-sm text-ink-black outline-none transition focus:border-ink-black";

export function FilterPanel({ filters, onChange }: Props) {
  return (
    <aside className="rounded-card bg-canvas-white p-6 shadow-[var(--shadow-subtle)]">
      <h3 className="mb-6 text-subheading font-semibold text-ink-black">Filter</h3>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="filter-year-min" className={fieldLabel}>
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
            className={fieldInput}
          />
        </div>
        <div>
          <label htmlFor="filter-year-max" className={fieldLabel}>
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
            className={fieldInput}
          />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="filter-author" className={fieldLabel}>
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
          className={fieldInput}
        />
      </div>

      <div className="mb-5">
        <label htmlFor="filter-source" className={fieldLabel}>
          Sumber
        </label>
        <select
          id="filter-source"
          value={filters.source ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange({ ...filters, source: v ? (v as SourceName) : undefined });
          }}
          className={fieldInput}
        >
          <option value="">Semua sumber</option>
          {ROUTE_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="filter-sort" className={fieldLabel}>
          Urutkan
        </label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as SearchSort })
          }
          className={fieldInput}
        >
          <option value="relevance">Relevansi</option>
          <option value="citations_desc">Sitasi terbanyak</option>
          <option value="year_desc">Tahun terbaru</option>
          <option value="year_asc">Tahun terlama</option>
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-body-sm text-graphite">
        <span className="relative inline-flex h-5 w-5 items-center justify-center">
          <input
            type="checkbox"
            checked={filters.oa_only}
            onChange={(e) => onChange({ ...filters, oa_only: e.target.checked })}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-hairline bg-canvas-white transition checked:border-sky-teal checked:bg-sky-teal"
          />
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute h-3 w-3 text-canvas-white opacity-0 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 10l4 4 8-8" />
          </svg>
        </span>
        Hanya open access
      </label>
    </aside>
  );
}

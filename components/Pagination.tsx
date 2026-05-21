"use client";

interface Props {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
    >
      <p className="text-center text-caption text-ash-gray sm:text-left">
        {start.toLocaleString("id-ID")}–{end.toLocaleString("id-ID")} dari{" "}
        {total.toLocaleString("id-ID")}
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Halaman sebelumnya"
          className="inline-flex items-center gap-1 rounded-pill border border-hairline bg-canvas-white px-3 py-2 text-[13px] text-ink-black transition hover:border-ink-black disabled:cursor-not-allowed disabled:border-hairline disabled:text-ash-gray sm:px-4 sm:text-body-sm"
        >
          <span aria-hidden>←</span>
          <span className="hidden xs:inline sm:inline">Sebelumnya</span>
        </button>
        <span className="text-[12px] text-deep-slate sm:text-body-sm">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Halaman berikutnya"
          className="inline-flex items-center gap-1 rounded-pill bg-button-black px-3 py-2 text-[13px] text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-body-sm"
        >
          <span className="hidden xs:inline sm:inline">Berikutnya</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </nav>
  );
}

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
      className="mt-10 flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-caption text-ash-gray">
        Menampilkan {start.toLocaleString("id-ID")}–{end.toLocaleString("id-ID")} dari{" "}
        {total.toLocaleString("id-ID")}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-pill border border-hairline bg-canvas-white px-4 py-2 text-body-sm text-ink-black transition hover:border-ink-black disabled:cursor-not-allowed disabled:border-hairline disabled:text-ash-gray"
        >
          Sebelumnya
        </button>
        <span className="text-body-sm text-deep-slate">
          Halaman {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-pill bg-button-black px-4 py-2 text-body-sm text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}

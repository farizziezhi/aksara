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
      className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-zinc-500 dark:text-zinc-400">
        Menampilkan {start.toLocaleString("id-ID")}–{end.toLocaleString("id-ID")} dari{" "}
        {total.toLocaleString("id-ID")}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Sebelumnya
        </button>
        <span className="text-zinc-600 dark:text-zinc-400">
          Halaman {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}

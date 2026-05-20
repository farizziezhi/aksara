"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  initialQuery?: string;
  onChange: (q: string) => void;
  debounceMs?: number;
}

export function SearchBar({ initialQuery = "", onChange, debounceMs = 400 }: Props) {
  const [value, setValue] = useState(initialQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(value), debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, debounceMs, onChange]);

  return (
    <div className="relative">
      <input
        type="search"
        autoFocus
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari paper open-access (judul, kata kunci, DOI, penulis)..."
        className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
        aria-label="Search query"
      />
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Minimal 3 karakter. Hasil otomatis muncul ketika kamu berhenti mengetik.
      </p>
    </div>
  );
}

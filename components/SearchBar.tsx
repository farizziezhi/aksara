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
    <div>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-ash-gray"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          autoFocus
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari paper open-access (judul, kata kunci, DOI, penulis)..."
          className="w-full rounded-pill border border-hairline bg-canvas-white py-4 pl-14 pr-6 text-base text-ink-black outline-none transition focus:border-ink-black"
          aria-label="Search query"
        />
      </div>
      <p className="mt-3 px-2 text-caption text-ash-gray">
        Minimal 3 karakter. Hasil otomatis muncul ketika kamu berhenti mengetik.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface Props {
  initialQuery?: string;
  onChange: (q: string) => void;
  debounceMs?: number;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchBar({ initialQuery = "", onChange, debounceMs = 400, inputRef }: Props) {
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
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash-gray sm:left-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          autoFocus
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari paper (judul, kata kunci, DOI)..."
          className="w-full rounded-pill border border-hairline bg-canvas-white py-3 pl-11 pr-4 text-[15px] text-ink-black outline-none transition placeholder:text-ash-gray focus:border-ink-black sm:py-4 sm:pl-14 sm:pr-24 sm:text-body"
          aria-label="Search query"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex"
        >
          <kbd className="rounded-md border border-hairline bg-subtle-cream px-1.5 py-0.5 text-[10px] font-medium text-ash-gray">
            ⌘
          </kbd>
          <kbd className="rounded-md border border-hairline bg-subtle-cream px-1.5 py-0.5 text-[10px] font-medium text-ash-gray">
            K
          </kbd>
        </span>
      </div>
      <p className="mt-2 px-2 text-[11px] text-ash-gray sm:mt-3 sm:text-caption">
        Minimal 3 karakter. Hasil otomatis muncul saat berhenti mengetik.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { PaperResult } from "../types/paper";
import { toApa, toBibtex } from "../lib/citation";

interface Props {
  paper: PaperResult;
}

export function CitationMenu({ paper }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setOpen(false);
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 1500);
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="rounded-pill border border-hairline bg-canvas-white px-3 py-1.5 text-[13px] text-ink-black transition hover:border-ink-black sm:px-[14px] sm:text-body-sm"
      >
        Kutip
      </button>
      {status === "copied" ? (
        <span className="text-caption text-sky-teal">Tersalin</span>
      ) : null}
      {status === "failed" ? (
        <span className="text-caption text-hot-pink">Gagal salin</span>
      ) : null}
      {open ? (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-20 mb-2 w-44 rounded-card border border-hairline bg-canvas-white p-2 shadow-[var(--shadow-subtle)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => copy(toBibtex(paper))}
            className="block w-full rounded-pill px-4 py-2 text-left text-body-sm text-ink-black transition hover:bg-subtle-cream"
          >
            Copy BibTeX
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => copy(toApa(paper))}
            className="block w-full rounded-pill px-4 py-2 text-left text-body-sm text-ink-black transition hover:bg-subtle-cream"
          >
            Copy APA
          </button>
        </div>
      ) : null}
    </div>
  );
}

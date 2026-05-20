"use client";

import { useState } from "react";
import type { PaperResult } from "../types/paper";
import { toApa, toBibtex } from "../lib/citation";

interface Props {
  paper: PaperResult;
}

export function CitationMenu({ paper }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

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
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-pill border border-hairline bg-canvas-white px-[14px] py-[6px] text-body-sm text-ink-black transition hover:border-ink-black"
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
        <div className="absolute bottom-full right-0 z-10 mb-2 min-w-44 rounded-card border border-hairline bg-canvas-white p-2 shadow-[var(--shadow-subtle)]">
          <button
            type="button"
            onClick={() => copy(toBibtex(paper))}
            className="block w-full rounded-pill px-4 py-2 text-left text-body-sm text-ink-black transition hover:bg-subtle-cream"
          >
            Copy BibTeX
          </button>
          <button
            type="button"
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

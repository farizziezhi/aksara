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
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        Kutip
      </button>
      {status === "copied" ? (
        <span className="text-xs text-emerald-600">Tersalin</span>
      ) : null}
      {status === "failed" ? (
        <span className="text-xs text-red-600">Gagal salin</span>
      ) : null}
      {open ? (
        <div className="absolute bottom-full left-0 z-10 mb-2 min-w-40 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => copy(toBibtex(paper))}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Copy BibTeX
          </button>
          <button
            type="button"
            onClick={() => copy(toApa(paper))}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Copy APA
          </button>
        </div>
      ) : null}
    </div>
  );
}

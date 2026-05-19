import type { PaperResult } from "../types/paper";
import { normalizeTitle } from "./deduplicator";

export interface RankOptions {
  query: string;
  now?: Date;
}

export function rank(papers: PaperResult[], opts: RankOptions): PaperResult[] {
  const tokens = tokenize(opts.query);
  const currentYear = (opts.now ?? new Date()).getFullYear();

  return [...papers]
    .map((p) => ({ p, s: score(p, tokens, currentYear) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}

function score(p: PaperResult, tokens: string[], currentYear: number): number {
  if (tokens.length === 0) return 0;
  const title = normalizeTitle(p.title);
  const abstract = p.abstract ? normalizeTitle(p.abstract) : "";
  const queryStr = tokens.join(" ");

  let s = 0;

  if (title === queryStr) s += 100;
  else if (title.includes(queryStr)) s += 60;

  let titleHits = 0;
  for (const t of tokens) if (title.includes(t)) titleHits++;
  s += (titleHits / tokens.length) * 40;

  let abstractHits = 0;
  if (abstract) {
    for (const t of tokens) if (abstract.includes(t)) abstractHits++;
    s += (abstractHits / tokens.length) * 15;
  }

  s += Math.log10(1 + Math.max(0, p.citation_count)) * 5;

  if (p.year) {
    const age = Math.max(0, currentYear - p.year);
    s += Math.max(0, 10 - age * 0.5);
  }

  if (p.is_open_access) s += 2;
  if (p.pdf_url) s += 1;

  return s;
}

function tokenize(query: string): string[] {
  return normalizeTitle(query)
    .split(" ")
    .filter((t) => t.length >= 2);
}

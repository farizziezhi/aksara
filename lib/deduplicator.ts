import type { PaperResult } from "../types/paper";
import { normalizeDoi } from "./sources/_shared";

const TITLE_SIMILARITY_THRESHOLD = 0.85;

export function deduplicate(papers: PaperResult[]): PaperResult[] {
  const byDoi = new Map<string, PaperResult>();
  const noDoi: PaperResult[] = [];

  for (const p of papers) {
    if (p.doi) {
      const key = normalizeDoi(p.doi);
      const existing = byDoi.get(key);
      byDoi.set(key, existing ? merge(existing, p) : p);
    } else {
      noDoi.push(p);
    }
  }

  const merged: PaperResult[] = [...byDoi.values()];
  const titleNormalized = merged.map((p) => normalizeTitle(p.title));

  for (const candidate of noDoi) {
    const candTitle = normalizeTitle(candidate.title);
    let dupIdx = -1;
    for (let i = 0; i < merged.length; i++) {
      if (similarity(candTitle, titleNormalized[i]) >= TITLE_SIMILARITY_THRESHOLD) {
        dupIdx = i;
        break;
      }
    }
    if (dupIdx === -1) {
      merged.push(candidate);
      titleNormalized.push(candTitle);
    } else {
      merged[dupIdx] = merge(merged[dupIdx], candidate);
    }
  }

  return merged;
}

function merge(a: PaperResult, b: PaperResult): PaperResult {
  return {
    id: a.id,
    title: longer(a.title, b.title),
    abstract: a.abstract ?? b.abstract,
    authors: a.authors.length >= b.authors.length ? a.authors : b.authors,
    year: a.year ?? b.year,
    doi: a.doi ?? b.doi,
    pdf_url: a.pdf_url ?? b.pdf_url,
    source: a.source,
    citation_count: Math.max(a.citation_count, b.citation_count),
    is_open_access: a.is_open_access || b.is_open_access,
  };
}

function longer(a: string, b: string): string {
  return b.length > a.length ? b : a;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const ag = bigrams(a);
  const bg = bigrams(b);
  if (ag.size === 0 || bg.size === 0) return 0;
  let inter = 0;
  for (const g of ag) if (bg.has(g)) inter++;
  return (2 * inter) / (ag.size + bg.size);
}

function bigrams(s: string): Set<string> {
  const set = new Set<string>();
  if (s.length < 2) {
    if (s) set.add(s);
    return set;
  }
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}

import { fetchJson, normalizeDoi } from "./_shared";

const ENDPOINT = "https://opencitations.net/index/coci/api/v1/citation-count";
const SOURCE = "OpenCitations";

interface CountRow {
  count?: string | number | null;
}

export async function getCitationCount(doi: string): Promise<number | null> {
  const normalized = normalizeDoi(doi);
  if (!normalized) return null;
  const url = `${ENDPOINT}/${encodeURIComponent(normalized)}`;
  try {
    const data = await fetchJson<CountRow[]>(url, {
      source: SOURCE,
      headers: { Accept: "application/json" },
    });
    const raw = data?.[0]?.count;
    if (raw === undefined || raw === null) return null;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function enrichCitationCounts(
  papers: { doi: string | null; citation_count: number }[],
  opts: { budgetMs?: number; concurrency?: number } = {},
): Promise<void> {
  const budgetMs = opts.budgetMs ?? 2500;
  const concurrency = opts.concurrency ?? 6;

  const targets = papers.filter(
    (p): p is typeof p & { doi: string } =>
      Boolean(p.doi) && (p.citation_count ?? 0) === 0,
  );
  if (!targets.length) return;

  const deadline = Date.now() + budgetMs;
  let i = 0;

  async function worker() {
    while (i < targets.length && Date.now() < deadline) {
      const idx = i++;
      const p = targets[idx];
      const count = await getCitationCount(p.doi);
      if (count !== null && count > 0) p.citation_count = count;
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, targets.length) }, () => worker()),
  );
}

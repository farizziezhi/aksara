import type { PaperResult } from "../../types/paper";
import {
  fetchJson,
  normalizeDoi,
  paperIdFromDoi,
  paperIdFromTitle,
} from "./_shared";

interface S2Author {
  authorId?: string | null;
  name?: string | null;
}

interface S2Paper {
  paperId?: string | null;
  title?: string | null;
  abstract?: string | null;
  year?: number | null;
  citationCount?: number | null;
  isOpenAccess?: boolean | null;
  openAccessPdf?: { url?: string | null; status?: string | null } | null;
  externalIds?: { DOI?: string | null } | null;
  authors?: S2Author[] | null;
}

interface S2Response {
  data?: S2Paper[];
}

const ENDPOINT = "https://api.semanticscholar.org/graph/v1/paper/search";
const SOURCE = "SemanticScholar" as const;

const FIELDS = [
  "paperId",
  "title",
  "abstract",
  "year",
  "citationCount",
  "isOpenAccess",
  "openAccessPdf",
  "externalIds",
  "authors.name",
].join(",");

export async function searchSemanticScholar(
  query: string,
  limit = 25,
): Promise<PaperResult[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 25)));
  url.searchParams.set("fields", FIELDS);

  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const data = await fetchJsonWithRetry<S2Response>(url.toString(), {
    source: SOURCE,
    headers,
  });

  const items = data.data ?? [];
  return items
    .map((p) => normalizePaper(p))
    .filter((p): p is PaperResult => p !== null);
}

async function fetchJsonWithRetry<T>(
  url: string,
  init: { source: string; headers: Record<string, string> },
): Promise<T> {
  try {
    return await fetchJson<T>(url, init);
  } catch (err) {
    const e = err as { status?: number };
    if (e?.status !== 429) throw err;
    await new Promise((r) => setTimeout(r, 1500));
    return fetchJson<T>(url, init);
  }
}

function normalizePaper(p: S2Paper): PaperResult | null {
  const title = p.title?.trim();
  if (!title) return null;

  const doi = p.externalIds?.DOI ? normalizeDoi(p.externalIds.DOI) : null;
  const id = doi ? paperIdFromDoi(doi) : paperIdFromTitle(title);

  const authors =
    p.authors
      ?.map((a) => a.name?.trim())
      .filter((n): n is string => Boolean(n)) ?? [];

  return {
    id,
    title,
    abstract: p.abstract?.trim() || null,
    authors,
    year: p.year ?? null,
    doi,
    pdf_url: p.openAccessPdf?.url ?? null,
    source: SOURCE,
    citation_count: p.citationCount ?? 0,
    is_open_access: Boolean(p.isOpenAccess) || Boolean(p.openAccessPdf?.url),
  };
}

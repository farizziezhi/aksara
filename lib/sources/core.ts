import type { PaperResult } from "../../types/paper";
import {
  fetchJson,
  normalizeDoi,
  paperIdFromDoi,
  paperIdFromTitle,
  SourceFetchError,
} from "./_shared";

interface CoreAuthor {
  name?: string | null;
}

interface CoreLink {
  type?: string | null;
  url?: string | null;
}

interface CoreWork {
  id?: number | string;
  doi?: string | null;
  title?: string | null;
  abstract?: string | null;
  yearPublished?: number | null;
  citationCount?: number | null;
  authors?: CoreAuthor[] | null;
  downloadUrl?: string | null;
  fullTextLink?: string | null;
  links?: CoreLink[] | null;
}

interface CoreSearchResponse {
  totalHits?: number;
  results?: CoreWork[];
}

const ENDPOINT = "https://api.core.ac.uk/v3/search/works";
const SOURCE = "CORE" as const;

export async function searchCORE(
  query: string,
  limit = 25,
): Promise<PaperResult[]> {
  const apiKey = process.env.CORE_API_KEY;
  if (!apiKey || apiKey === "your_core_api_key_here") {
    throw new SourceFetchError(SOURCE, "CORE_API_KEY not configured");
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 25)));

  const data = await fetchJson<CoreSearchResponse>(url.toString(), {
    source: SOURCE,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  const works = data.results ?? [];
  return works
    .map((w) => normalizeWork(w))
    .filter((p): p is PaperResult => p !== null);
}

function normalizeWork(w: CoreWork): PaperResult | null {
  const title = w.title?.trim() || null;
  if (!title) return null;

  const doi = w.doi ? normalizeDoi(w.doi) : null;
  const id = doi ? paperIdFromDoi(doi) : paperIdFromTitle(title);

  const authors =
    w.authors
      ?.map((a) => a.name?.trim())
      .filter((n): n is string => Boolean(n)) ?? [];

  const pdf =
    w.downloadUrl ??
    w.fullTextLink ??
    w.links?.find((l) => l.type === "download" || l.type === "fulltext")?.url ??
    null;

  return {
    id,
    title,
    abstract: w.abstract?.trim() || null,
    authors,
    year: w.yearPublished ?? null,
    doi,
    pdf_url: pdf,
    source: SOURCE,
    citation_count: w.citationCount ?? 0,
    is_open_access: true,
  };
}

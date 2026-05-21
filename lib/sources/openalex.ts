import type { PaperResult } from "../../types/paper";
import {
  fetchJson,
  normalizeDoi,
  paperIdFromDoi,
  paperIdFromTitle,
} from "./_shared";

interface OpenAlexAuthor {
  author?: { display_name?: string | null };
}

interface OpenAlexWork {
  id?: string;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_year?: number | null;
  cited_by_count?: number | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  authorships?: OpenAlexAuthor[];
  open_access?: {
    is_oa?: boolean | null;
    oa_url?: string | null;
  } | null;
  best_oa_location?: { pdf_url?: string | null } | null;
  primary_location?: { pdf_url?: string | null } | null;
}

interface OpenAlexResponse {
  results?: OpenAlexWork[];
}

const ENDPOINT = "https://api.openalex.org/works";
const SOURCE = "OpenAlex" as const;

export interface OpenAlexOptions {
  countryCode?: string | null;
}

export async function searchOpenAlex(
  query: string,
  limit = 25,
  options: OpenAlexOptions = {},
): Promise<PaperResult[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("search", query);
  url.searchParams.set("per-page", String(Math.min(Math.max(limit, 1), 25)));
  const email = process.env.UNPAYWALL_EMAIL;
  if (email) url.searchParams.set("mailto", email);

  const filters: string[] = [];
  if (options.countryCode) {
    filters.push(`institutions.country_code:${options.countryCode.toLowerCase()}`);
  }
  if (filters.length) url.searchParams.set("filter", filters.join(","));

  const data = await fetchJson<OpenAlexResponse>(url.toString(), {
    source: SOURCE,
    headers: { Accept: "application/json" },
  });

  const works = data.results ?? [];
  return works
    .map((w) => normalizeWork(w))
    .filter((p): p is PaperResult => p !== null);
}

export async function fetchOpenAlexById(arxivId: string): Promise<PaperResult[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("filter", `ids.openalex:!null,fulltext.search:${arxivId}`);
  url.searchParams.set("per-page", "5");
  const email = process.env.UNPAYWALL_EMAIL;
  if (email) url.searchParams.set("mailto", email);

  const data = await fetchJson<OpenAlexResponse>(url.toString(), {
    source: SOURCE,
    headers: { Accept: "application/json" },
  });
  return (data.results ?? [])
    .map((w) => normalizeWork(w))
    .filter((p): p is PaperResult => p !== null);
}

function normalizeWork(w: OpenAlexWork): PaperResult | null {
  const title = w.title ?? w.display_name ?? null;
  if (!title) return null;

  const doi = w.doi ? normalizeDoi(w.doi) : null;
  const id = doi ? paperIdFromDoi(doi) : paperIdFromTitle(title);
  const authors =
    w.authorships
      ?.map((a) => a.author?.display_name?.trim())
      .filter((n): n is string => Boolean(n)) ?? [];

  const pdf =
    w.best_oa_location?.pdf_url ??
    w.primary_location?.pdf_url ??
    w.open_access?.oa_url ??
    null;

  return {
    id,
    title,
    abstract: reconstructAbstract(w.abstract_inverted_index),
    authors,
    year: w.publication_year ?? null,
    doi,
    pdf_url: pdf,
    source: SOURCE,
    citation_count: w.cited_by_count ?? 0,
    is_open_access: w.open_access?.is_oa ?? false,
  };
}

function reconstructAbstract(
  inverted: Record<string, number[]> | null | undefined,
): string | null {
  if (!inverted) return null;
  const positions: { word: string; pos: number }[] = [];
  for (const [word, idxs] of Object.entries(inverted)) {
    for (const pos of idxs) positions.push({ word, pos });
  }
  if (!positions.length) return null;
  positions.sort((a, b) => a.pos - b.pos);
  return positions.map((p) => p.word).join(" ");
}

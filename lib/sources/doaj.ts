import type { PaperResult } from "../../types/paper";
import {
  fetchJson,
  normalizeDoi,
  paperIdFromDoi,
  paperIdFromTitle,
} from "./_shared";

interface DoajAuthor {
  name?: string | null;
}

interface DoajIdentifier {
  type?: string | null;
  id?: string | null;
}

interface DoajLink {
  type?: string | null;
  url?: string | null;
}

interface DoajBibjson {
  title?: string | null;
  abstract?: string | null;
  year?: string | number | null;
  author?: DoajAuthor[] | null;
  identifier?: DoajIdentifier[] | null;
  link?: DoajLink[] | null;
}

interface DoajWork {
  id?: string;
  bibjson?: DoajBibjson;
}

interface DoajResponse {
  results?: DoajWork[];
}

const SOURCE = "DOAJ" as const;

export interface DoajOptions {
  countryCode?: string | null;
}

export async function searchDOAJ(
  query: string,
  limit = 25,
  options: DoajOptions = {},
): Promise<PaperResult[]> {
  const pageSize = Math.min(Math.max(limit, 1), 25);
  let q = query;
  if (options.countryCode) {
    q = `${query} AND bibjson.journal.country.exact:${options.countryCode.toUpperCase()}`;
  }
  const url = `https://doaj.org/api/search/articles/${encodeURIComponent(q)}?pageSize=${pageSize}`;
  const data = await fetchJson<DoajResponse>(url, {
    source: SOURCE,
    headers: { Accept: "application/json" },
  });

  const works = data.results ?? [];
  return works
    .map((w) => normalizeWork(w))
    .filter((p): p is PaperResult => p !== null);
}

function normalizeWork(w: DoajWork): PaperResult | null {
  const b = w.bibjson;
  if (!b) return null;
  const title = b.title?.trim() || null;
  if (!title) return null;

  const doiId = b.identifier?.find((i) => i.type?.toLowerCase() === "doi")?.id;
  const doi = doiId ? normalizeDoi(doiId) : null;
  const id = doi ? paperIdFromDoi(doi) : paperIdFromTitle(title);

  const authors =
    b.author
      ?.map((a) => a.name?.trim())
      .filter((n): n is string => Boolean(n)) ?? [];

  const yearRaw = b.year;
  const year =
    typeof yearRaw === "number"
      ? yearRaw
      : typeof yearRaw === "string"
      ? Number(yearRaw) || null
      : null;

  const fulltext = b.link?.find(
    (l) => l.type?.toLowerCase() === "fulltext",
  )?.url;

  return {
    id,
    title,
    abstract: b.abstract?.trim() || null,
    authors,
    year,
    doi,
    pdf_url: fulltext ?? null,
    source: SOURCE,
    citation_count: 0,
    is_open_access: true,
  };
}

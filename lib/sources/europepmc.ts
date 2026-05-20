import type { PaperResult } from "../../types/paper";
import {
  fetchJson,
  normalizeDoi,
  paperIdFromDoi,
  paperIdFromTitle,
} from "./_shared";

interface EpmcAuthor {
  fullName?: string | null;
}

interface EpmcResult {
  id?: string | null;
  source?: string | null;
  pmid?: string | null;
  pmcid?: string | null;
  doi?: string | null;
  title?: string | null;
  authorList?: { author?: EpmcAuthor[] } | null;
  authorString?: string | null;
  pubYear?: string | null;
  abstractText?: string | null;
  citedByCount?: number | null;
  isOpenAccess?: "Y" | "N" | null;
  fullTextUrlList?: {
    fullTextUrl?: {
      documentStyle?: string | null;
      site?: string | null;
      url?: string | null;
      availability?: string | null;
    }[];
  } | null;
}

interface EpmcResponse {
  resultList?: { result?: EpmcResult[] };
}

const ENDPOINT = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
const SOURCE = "EuropePMC" as const;

export async function searchEuropePMC(
  query: string,
  limit = 25,
): Promise<PaperResult[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageSize", String(Math.min(Math.max(limit, 1), 25)));
  url.searchParams.set("resultType", "core");

  const data = await fetchJson<EpmcResponse>(url.toString(), {
    source: SOURCE,
    headers: { Accept: "application/json" },
  });

  const items = data.resultList?.result ?? [];
  return items
    .map((r) => normalize(r))
    .filter((p): p is PaperResult => p !== null);
}

function normalize(r: EpmcResult): PaperResult | null {
  const title = r.title?.trim();
  if (!title) return null;

  const doi = r.doi ? normalizeDoi(r.doi) : null;
  const id = doi ? paperIdFromDoi(doi) : paperIdFromTitle(title);

  const authors =
    r.authorList?.author
      ?.map((a) => a.fullName?.trim())
      .filter((n): n is string => Boolean(n)) ??
    splitAuthorString(r.authorString);

  const year = r.pubYear ? Number(r.pubYear) : null;
  const pdf = pickPdf(r);
  const oa = r.isOpenAccess === "Y" || Boolean(pdf);

  return {
    id,
    title,
    abstract: r.abstractText?.trim() || null,
    authors,
    year: year && Number.isFinite(year) ? year : null,
    doi,
    pdf_url: pdf,
    source: SOURCE,
    citation_count: r.citedByCount ?? 0,
    is_open_access: oa,
  };
}

function splitAuthorString(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

function pickPdf(r: EpmcResult): string | null {
  const list = r.fullTextUrlList?.fullTextUrl ?? [];
  const pdf = list.find(
    (u) => u.documentStyle?.toLowerCase() === "pdf" && u.url,
  );
  if (pdf?.url) return pdf.url;
  if (r.pmcid) return `https://europepmc.org/articles/${r.pmcid}?pdf=render`;
  return null;
}

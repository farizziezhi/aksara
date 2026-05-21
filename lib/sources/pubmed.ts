import type { PaperResult } from "../../types/paper";
import { fetchJson, normalizeDoi, paperIdFromDoi, paperIdFromTitle } from "./_shared";

const ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
const SOURCE = "PubMed" as const;

interface ESearchResp {
  esearchresult?: { idlist?: string[] };
}

interface PubMedAuthor {
  name?: string;
}

interface PubMedArticleId {
  idtype?: string;
  value?: string;
}

interface PubMedDoc {
  uid?: string;
  title?: string;
  pubdate?: string;
  authors?: PubMedAuthor[];
  articleids?: PubMedArticleId[];
  fulljournalname?: string;
  source?: string;
  pmcrefcount?: number | string | null;
}

interface ESummaryResp {
  result?: Record<string, PubMedDoc | string[] | undefined> & {
    uids?: string[];
  };
}

export async function searchPubMed(query: string, limit = 25): Promise<PaperResult[]> {
  const email = process.env.UNPAYWALL_EMAIL;
  const apiKey = process.env.PUBMED_API_KEY;

  const ids = await esearch(query, limit, email, apiKey);
  if (!ids.length) return [];
  const docs = await esummary(ids, email, apiKey);

  return ids
    .map((id) => docs[id])
    .filter((d): d is PubMedDoc => Boolean(d && typeof d === "object" && "title" in d))
    .map((d) => normalize(d))
    .filter((p): p is PaperResult => p !== null);
}

async function esearch(
  query: string,
  limit: number,
  email: string | undefined,
  apiKey: string | undefined,
): Promise<string[]> {
  const url = new URL(ESEARCH);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("term", query);
  url.searchParams.set("retmode", "json");
  url.searchParams.set("retmax", String(Math.min(Math.max(limit, 1), 25)));
  url.searchParams.set("sort", "relevance");
  url.searchParams.set("tool", "aksara-oaj-search");
  if (email) url.searchParams.set("email", email);
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const data = await fetchJson<ESearchResp>(url.toString(), {
    source: SOURCE,
    headers: { Accept: "application/json" },
  });
  return data.esearchresult?.idlist ?? [];
}

async function esummary(
  ids: string[],
  email: string | undefined,
  apiKey: string | undefined,
): Promise<Record<string, PubMedDoc>> {
  const url = new URL(ESUMMARY);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("retmode", "json");
  url.searchParams.set("tool", "aksara-oaj-search");
  if (email) url.searchParams.set("email", email);
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const data = await fetchJson<ESummaryResp>(url.toString(), {
    source: SOURCE,
    headers: { Accept: "application/json" },
  });
  const result = data.result ?? {};
  const out: Record<string, PubMedDoc> = {};
  for (const [k, v] of Object.entries(result)) {
    if (k === "uids") continue;
    if (v && typeof v === "object" && !Array.isArray(v) && "title" in v) {
      out[k] = v as PubMedDoc;
    }
  }
  return out;
}

function normalize(d: PubMedDoc): PaperResult | null {
  const title = d.title?.replace(/\.$/, "").trim();
  if (!title) return null;

  const doi = pickDoi(d.articleids);
  const pmcid = pickPmcid(d.articleids);
  const id = doi ? paperIdFromDoi(doi) : paperIdFromTitle(title);

  const authors = (d.authors ?? [])
    .map((a) => a.name?.trim())
    .filter((n): n is string => Boolean(n));

  const year = parseYear(d.pubdate);
  const pdfUrl = pmcid ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/pdf/` : null;
  const cites = typeof d.pmcrefcount === "number" ? d.pmcrefcount : Number(d.pmcrefcount) || 0;

  return {
    id,
    title,
    abstract: null,
    authors,
    year,
    doi,
    pdf_url: pdfUrl,
    source: SOURCE,
    citation_count: Number.isFinite(cites) ? cites : 0,
    is_open_access: Boolean(pmcid),
  };
}

function pickDoi(ids: PubMedArticleId[] | undefined): string | null {
  const doi = ids?.find((i) => i.idtype?.toLowerCase() === "doi")?.value;
  return doi ? normalizeDoi(doi) : null;
}

function pickPmcid(ids: PubMedArticleId[] | undefined): string | null {
  const pmc = ids?.find((i) => i.idtype?.toLowerCase() === "pmc" || i.idtype?.toLowerCase() === "pmcid")?.value;
  if (!pmc) return null;
  return pmc.startsWith("PMC") ? pmc : `PMC${pmc}`;
}

function parseYear(pubdate: string | undefined): number | null {
  if (!pubdate) return null;
  const m = pubdate.match(/\b(19|20)\d{2}\b/);
  if (!m) return null;
  const y = Number(m[0]);
  return Number.isFinite(y) ? y : null;
}

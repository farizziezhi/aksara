import type { PaperResult } from "../../types/paper";
import {
  fetchText,
  normalizeDoi,
  paperIdFromDoi,
  paperIdFromTitle,
} from "./_shared";

const ENDPOINT = "http://export.arxiv.org/api/query";
const SOURCE = "arXiv" as const;

export const ARXIV_ID_RE = /\b(\d{4}\.\d{4,5}(?:v\d+)?|[a-z\-]+(?:\.[A-Z]{2})?\/\d{7})\b/i;

export function detectArxivId(query: string): string | null {
  const cleaned = query.trim().replace(/^arxiv:/i, "");
  const m = cleaned.match(ARXIV_ID_RE);
  return m ? m[0].replace(/v\d+$/i, "") : null;
}

export async function fetchArxivById(arxivId: string): Promise<PaperResult[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("id_list", arxivId);
  url.searchParams.set("max_results", "1");
  const xml = await fetchText(url.toString(), { source: SOURCE });
  return parseAtomFeed(xml);
}

export async function searchArXiv(
  query: string,
  limit = 25,
): Promise<PaperResult[]> {
  const id = detectArxivId(query);
  if (id) return fetchArxivById(id);

  const url = new URL(ENDPOINT);
  url.searchParams.set("search_query", `all:${query}`);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", String(Math.min(Math.max(limit, 1), 25)));
  url.searchParams.set("sortBy", "relevance");
  url.searchParams.set("sortOrder", "descending");

  const xml = await fetchText(url.toString(), { source: SOURCE });
  return parseAtomFeed(xml);
}

function parseAtomFeed(xml: string): PaperResult[] {
  const entries = matchAll(xml, /<entry\b[\s\S]*?<\/entry>/g);
  return entries
    .map((entry) => parseEntry(entry))
    .filter((p): p is PaperResult => p !== null);
}

function parseEntry(entry: string): PaperResult | null {
  const title = textOf(entry, "title");
  if (!title) return null;

  const summary = textOf(entry, "summary");
  const published = textOf(entry, "published");
  const year = published ? Number(published.slice(0, 4)) || null : null;

  const idTag = textOf(entry, "id");
  const arxivId = idTag ? idTag.replace(/^https?:\/\/arxiv\.org\/abs\//, "") : null;

  const doiTag = matchFirst(entry, /<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/);
  const doi = doiTag ? normalizeDoi(doiTag) : null;

  const authors = matchAll(entry, /<author>[\s\S]*?<\/author>/g)
    .map((a) => textOf(a, "name"))
    .filter((n): n is string => Boolean(n));

  const pdfLink =
    matchFirst(
      entry,
      /<link[^>]*\btitle="pdf"[^>]*\bhref="([^"]+)"/,
    ) ??
    matchFirst(
      entry,
      /<link[^>]*\bhref="([^"]+)"[^>]*\btitle="pdf"/,
    ) ??
    (arxivId ? `https://arxiv.org/pdf/${arxivId}` : null);

  const id = doi
    ? paperIdFromDoi(doi)
    : arxivId
    ? paperIdFromTitle(`arxiv:${arxivId}`)
    : paperIdFromTitle(title);

  return {
    id,
    title: collapse(title),
    abstract: summary ? collapse(summary) : null,
    authors,
    year,
    doi,
    pdf_url: pdfLink,
    source: SOURCE,
    citation_count: 0,
    is_open_access: true,
  };
}

function textOf(haystack: string, tag: string): string | null {
  const m = haystack.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!m) return null;
  return decodeXml(m[1]).trim();
}

function matchAll(haystack: string, re: RegExp): string[] {
  return [...haystack.matchAll(re)].map((m) => m[0]);
}

function matchFirst(haystack: string, re: RegExp): string | null {
  const m = haystack.match(re);
  return m ? decodeXml(m[1]).trim() : null;
}

function collapse(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

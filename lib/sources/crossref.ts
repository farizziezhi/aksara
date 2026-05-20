import type { PaperResult } from "../../types/paper";
import {
  fetchJson,
  normalizeDoi,
  paperIdFromDoi,
  paperIdFromTitle,
} from "./_shared";

interface CrossrefAuthor {
  given?: string | null;
  family?: string | null;
  name?: string | null;
}

interface CrossrefLink {
  URL?: string | null;
  "content-type"?: string | null;
  "intended-application"?: string | null;
}

interface CrossrefDate {
  "date-parts"?: number[][] | null;
}

interface CrossrefLicense {
  URL?: string | null;
  "content-version"?: string | null;
}

interface CrossrefWork {
  DOI?: string | null;
  title?: string[] | null;
  subtitle?: string[] | null;
  author?: CrossrefAuthor[] | null;
  abstract?: string | null;
  "is-referenced-by-count"?: number | null;
  issued?: CrossrefDate | null;
  published?: CrossrefDate | null;
  "published-print"?: CrossrefDate | null;
  "published-online"?: CrossrefDate | null;
  link?: CrossrefLink[] | null;
  license?: CrossrefLicense[] | null;
  URL?: string | null;
}

interface CrossrefResponse {
  message?: { items?: CrossrefWork[] };
}

const ENDPOINT = "https://api.crossref.org/works";
const SOURCE = "Crossref" as const;

export async function searchCrossref(
  query: string,
  limit = 25,
): Promise<PaperResult[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("rows", String(Math.min(Math.max(limit, 1), 25)));
  url.searchParams.set(
    "select",
    "DOI,title,subtitle,author,abstract,is-referenced-by-count,issued,published,published-print,published-online,link,license,URL",
  );
  const email = process.env.UNPAYWALL_EMAIL;
  if (email) url.searchParams.set("mailto", email);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (email) {
    headers["User-Agent"] = `OpenAccessJournalSearch/0.1 (mailto:${email})`;
  }

  const data = await fetchJson<CrossrefResponse>(url.toString(), {
    source: SOURCE,
    headers,
  });

  const items = data.message?.items ?? [];
  return items
    .map((w) => normalizeWork(w))
    .filter((p): p is PaperResult => p !== null);
}

function normalizeWork(w: CrossrefWork): PaperResult | null {
  const title = (w.title?.[0] ?? "").trim();
  if (!title) return null;

  const doi = w.DOI ? normalizeDoi(w.DOI) : null;
  const id = doi ? paperIdFromDoi(doi) : paperIdFromTitle(title);

  const authors =
    w.author
      ?.map((a) => {
        if (a.name) return a.name.trim();
        const parts = [a.given, a.family].filter(Boolean).join(" ").trim();
        return parts || null;
      })
      .filter((n): n is string => Boolean(n)) ?? [];

  const year = pickYear(w);
  const pdfUrl = pickPdfLink(w.link);
  const oa = isOpenAccess(w.license, pdfUrl);

  return {
    id,
    title,
    abstract: stripJats(w.abstract),
    authors,
    year,
    doi,
    pdf_url: pdfUrl,
    source: SOURCE,
    citation_count: w["is-referenced-by-count"] ?? 0,
    is_open_access: oa,
  };
}

function pickYear(w: CrossrefWork): number | null {
  const candidates = [
    w["published-print"],
    w.published,
    w["published-online"],
    w.issued,
  ];
  for (const c of candidates) {
    const y = c?.["date-parts"]?.[0]?.[0];
    if (typeof y === "number" && y >= 1000 && y <= 9999) return y;
  }
  return null;
}

function pickPdfLink(links: CrossrefLink[] | null | undefined): string | null {
  if (!links?.length) return null;
  const pdf = links.find(
    (l) => l["content-type"]?.toLowerCase() === "application/pdf" && l.URL,
  );
  return pdf?.URL ?? null;
}

const OA_LICENSE_HINTS = [
  "creativecommons.org",
  "/by/",
  "/by-sa/",
  "/by-nc/",
  "/by-nd/",
  "/zero/",
  "/publicdomain/",
];

function isOpenAccess(
  licenses: CrossrefLicense[] | null | undefined,
  pdfUrl: string | null,
): boolean {
  if (!licenses?.length) return false;
  for (const l of licenses) {
    const u = l.URL?.toLowerCase() ?? "";
    if (OA_LICENSE_HINTS.some((h) => u.includes(h))) return true;
  }
  return Boolean(pdfUrl);
}

function stripJats(s: string | null | undefined): string | null {
  if (!s) return null;
  const cleaned = s
    .replace(/<jats:[^>]+>/gi, "")
    .replace(/<\/jats:[^>]+>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}

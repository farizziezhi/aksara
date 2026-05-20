import type { PaperResult } from "../types/paper";

const STOPWORDS = new Set(["a", "an", "the", "of", "and", "or", "in", "on", "for", "to", "with"]);

export function toBibtex(paper: PaperResult): string {
  const key = citationKey(paper);
  const fields: [string, string][] = [
    ["author", paper.authors.map(toBibtexAuthor).join(" and ") || "Unknown"],
    ["title", `{${escapeBibtex(paper.title)}}`],
    ["year", paper.year ? String(paper.year) : "n.d."],
    ["howpublished", paper.source],
    ["note", paper.is_open_access ? "Open access" : paper.source],
  ];

  if (paper.doi) fields.push(["doi", paper.doi]);
  else if (paper.pdf_url) fields.push(["url", paper.pdf_url]);

  const body = fields.map(([k, v]) => `  ${k} = {${v}}`).join(",\n");
  return `@misc{${key},\n${body}\n}`;
}

export function toApa(paper: PaperResult): string {
  const authors = formatApaAuthors(paper.authors) || "Unknown author";
  const year = paper.year ? String(paper.year) : "n.d.";
  const suffix = paper.doi
    ? ` https://doi.org/${paper.doi}`
    : paper.pdf_url
      ? ` ${paper.pdf_url}`
      : "";
  return `${authors} (${year}). ${sentenceCaseTitle(paper.title)}. ${paper.source}.${suffix}`;
}

export function citationKey(paper: PaperResult): string {
  const last = paper.authors[0] ? lastName(paper.authors[0]) : "unknown";
  const year = paper.year ? String(paper.year) : "nd";
  const word = firstSignificantWord(paper.title) ?? "paper";
  return ascii(`${last}${year}${word}`).toLowerCase();
}

export function formatApaAuthors(authors: string[]): string {
  const formatted = authors.map(toApaAuthor).filter(Boolean);
  if (formatted.length === 0) return "";
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  if (formatted.length <= 20) {
    return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`;
  }
  return `${formatted.slice(0, 19).join(", ")}, ... ${formatted[formatted.length - 1]}`;
}

function toBibtexAuthor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name.trim();
  const last = parts.at(-1)!;
  const first = parts.slice(0, -1).join(" ");
  return `${last}, ${first}`;
}

function toApaAuthor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const last = parts.at(-1)!;
  const initials = parts.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`).join(" ");
  return `${last}, ${initials}`;
}

function lastName(name: string): string {
  return name.trim().split(/\s+/).at(-1) ?? "unknown";
}

function firstSignificantWord(title: string): string | null {
  for (const w of title.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
    if (!STOPWORDS.has(w)) return w;
  }
  return null;
}

function escapeBibtex(s: string): string {
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function sentenceCaseTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

function ascii(s: string): string {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

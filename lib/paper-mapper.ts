import type { PaperResult, SourceName } from "../types/paper";
import { SOURCE_NAMES } from "../types/paper";

export interface PaperRow {
  id: string;
  title: string;
  abstract: string | null;
  year: number | null;
  doi: string | null;
  pdf_url: string | null;
  source: string;
  citation_count: number;
  is_open_access: boolean;
  authors: { name: string }[];
}

export function paperRowToResult(row: PaperRow): PaperResult {
  const source: SourceName = (SOURCE_NAMES as readonly string[]).includes(row.source)
    ? (row.source as SourceName)
    : "OpenAlex";
  return {
    id: row.id,
    title: row.title,
    abstract: row.abstract,
    authors: row.authors.map((a) => a.name),
    year: row.year,
    doi: row.doi,
    pdf_url: row.pdf_url,
    source,
    citation_count: row.citation_count,
    is_open_access: row.is_open_access,
  };
}

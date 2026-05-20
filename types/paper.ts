export const SOURCE_NAMES = [
  "OpenAlex",
  "CORE",
  "arXiv",
  "DOAJ",
  "Crossref",
  "EuropePMC",
  "Unpaywall",
] as const;

export type SourceName = (typeof SOURCE_NAMES)[number];

export interface PaperResult {
  id: string;
  title: string;
  abstract: string | null;
  authors: string[];
  year: number | null;
  doi: string | null;
  pdf_url: string | null;
  source: SourceName;
  citation_count: number;
  is_open_access: boolean;
}

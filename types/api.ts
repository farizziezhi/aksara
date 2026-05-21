import type { PaperResult, SourceName } from "./paper";

export type SearchSort = "relevance" | "citations_desc" | "year_desc" | "year_asc";

export interface SearchRequestQuery {
  q: string;
  page?: number;
  limit?: number;
  year?: number;
  year_min?: number;
  year_max?: number;
  source?: Lowercase<SourceName>;
  oa_only?: boolean;
  author?: string;
  sort?: SearchSort;
  topic?: string;
  country?: string;
}

export interface SearchSuccessResponse {
  query: string;
  total: number;
  page: number;
  limit: number;
  from_cache: boolean;
  sources_queried: SourceName[];
  sources_failed: SourceName[];
  warning?: string;
  results: PaperResult[];
}

export type SearchErrorCode =
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE";

export interface SearchErrorResponse {
  error: SearchErrorCode;
  message: string;
}

export type SearchResponse = SearchSuccessResponse | SearchErrorResponse;

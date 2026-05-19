import type { PaperResult, SourceName } from "./paper";

export interface SearchRequestQuery {
  q: string;
  page?: number;
  limit?: number;
  year?: number;
  source?: Lowercase<SourceName>;
  oa_only?: boolean;
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

export type SearchErrorCode = "BAD_REQUEST" | "SERVICE_UNAVAILABLE";

export interface SearchErrorResponse {
  error: SearchErrorCode;
  message: string;
}

export type SearchResponse = SearchSuccessResponse | SearchErrorResponse;

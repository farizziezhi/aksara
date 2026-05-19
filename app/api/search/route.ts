import { z } from "zod";
import type { NextRequest } from "next/server";
import { aggregate } from "../../../lib/aggregator";
import {
  getCachedResult,
  hashQuery,
  saveToCache,
} from "../../../lib/cache";
import {
  getClientIp,
  rateLimitHeaders,
  searchLimiter,
} from "../../../lib/rate-limit";
import type {
  SearchErrorResponse,
  SearchSuccessResponse,
} from "../../../types/api";
import type { PaperResult, SourceName } from "../../../types/paper";
import { SOURCE_NAMES } from "../../../types/paper";

export const dynamic = "force-dynamic";

const SOURCE_LOOKUP = new Map(
  SOURCE_NAMES.map((s) => [s.toLowerCase(), s] as const),
);

const querySchema = z.object({
  q: z
    .string()
    .trim()
    .min(3, "Query minimal 3 karakter.")
    .max(200, "Query maksimal 200 karakter."),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(25).default(10),
  year: z
    .coerce.number()
    .int()
    .min(1000)
    .max(9999)
    .optional(),
  source: z.string().trim().toLowerCase().optional(),
  oa_only: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v !== "false"),
});

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = searchLimiter.check(ip);
  if (!rl.allowed) {
    return jsonError(
      {
        error: "RATE_LIMITED",
        message: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfterSec} detik.`,
      },
      429,
      rateLimitHeaders(rl),
    );
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    year: url.searchParams.get("year") ?? undefined,
    source: url.searchParams.get("source") ?? undefined,
    oa_only: url.searchParams.get("oa_only") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      {
        error: "BAD_REQUEST",
        message: parsed.error.issues[0]?.message ?? "Parameter tidak valid.",
      },
      400,
      rateLimitHeaders(rl),
    );
  }

  const { q, page, limit, year, source, oa_only } = parsed.data;

  let sourceFilter: SourceName | undefined;
  if (source) {
    const matched = SOURCE_LOOKUP.get(source);
    if (!matched) {
      return jsonError(
        { error: "BAD_REQUEST", message: `source tidak dikenal: ${source}` },
        400,
        rateLimitHeaders(rl),
      );
    }
    sourceFilter = matched;
  }

  const hash = hashQuery(q);

  let papers: PaperResult[] | null = await getCachedResult(hash);
  let fromCache = papers !== null;
  let sourcesQueried: SourceName[] = [];
  let sourcesFailed: SourceName[] = [];

  if (!papers) {
    const out = await aggregate({ query: q });
    sourcesQueried = out.sources_queried;
    sourcesFailed = out.sources_failed;
    papers = out.results;

    if (sourcesQueried.length === 0) {
      return jsonError(
        {
          error: "SERVICE_UNAVAILABLE",
          message:
            "Semua sumber tidak dapat dijangkau saat ini. Coba lagi beberapa saat.",
        },
        503,
        rateLimitHeaders(rl),
      );
    }

    saveToCache(hash, q, papers).catch((err) => {
      console.error("[cache] save failed:", err);
    });
  }

  let filtered = papers;
  if (year !== undefined) filtered = filtered.filter((p) => p.year === year);
  if (oa_only) filtered = filtered.filter((p) => p.is_open_access);
  if (sourceFilter) filtered = filtered.filter((p) => p.source === sourceFilter);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const pageResults = filtered.slice(start, start + limit);

  const body: SearchSuccessResponse = {
    query: q,
    total,
    page,
    limit,
    from_cache: fromCache,
    sources_queried: fromCache ? [] : sourcesQueried,
    sources_failed: fromCache ? [] : sourcesFailed,
    results: pageResults,
    ...(sourcesFailed.length > 0
      ? {
          warning:
            "Beberapa sumber tidak dapat dijangkau. Hasil mungkin tidak lengkap.",
        }
      : {}),
  };

  return Response.json(body, { headers: rateLimitHeaders(rl) });
}

function jsonError(
  body: SearchErrorResponse,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return Response.json(body, { status, headers });
}

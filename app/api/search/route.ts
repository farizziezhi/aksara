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
import { TOPIC_VALUES, type Topic } from "../../../lib/topics";

export const dynamic = "force-dynamic";

const SOURCE_LOOKUP = new Map(
  SOURCE_NAMES.map((s) => [s.toLowerCase(), s] as const),
);
const sortValues = ["relevance", "citations_desc", "year_desc", "year_asc"] as const;

const querySchema = z
  .object({
    q: z
      .string()
      .trim()
      .min(3, "Query minimal 3 karakter.")
      .max(200, "Query maksimal 200 karakter."),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(25).default(10),
    year: z.coerce.number().int().min(1000).max(9999).optional(),
    year_min: z.coerce.number().int().min(1000).max(9999).optional(),
    year_max: z.coerce.number().int().min(1000).max(9999).optional(),
    source: z.string().trim().toLowerCase().optional(),
    oa_only: z
      .union([z.literal("true"), z.literal("false")])
      .optional()
      .transform((v) => v !== "false"),
    author: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((v) => (v ? v : undefined)),
    sort: z.enum(sortValues).default("relevance"),
    topic: z.enum(TOPIC_VALUES).default("all"),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, "country harus 2 huruf ISO.")
      .optional(),
  })
  .refine(
    (v) =>
      v.year_min === undefined ||
      v.year_max === undefined ||
      v.year_min <= v.year_max,
    { message: "year_min harus lebih kecil atau sama dengan year_max." },
  );

export async function GET(req: NextRequest) {
  try {
    return await handle(req);
  } catch (err) {
    const e = err as Error;
    console.error("[/api/search] crash:", e?.stack ?? e);
    return Response.json(
      {
        error: "SERVICE_UNAVAILABLE",
        message: `Server error: ${e?.message ?? "unknown"}`,
      },
      { status: 500 },
    );
  }
}

async function handle(req: NextRequest) {
  let stage = "start";
  function tag(err: unknown): Error {
    const e = err instanceof Error ? err : new Error(String(err));
    e.message = `${stage}: ${e.message}`;
    return e;
  }

  stage = "rate-limit";
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

  stage = "parse";
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    year: url.searchParams.get("year") ?? undefined,
    year_min: url.searchParams.get("year_min") ?? undefined,
    year_max: url.searchParams.get("year_max") ?? undefined,
    source: url.searchParams.get("source") ?? undefined,
    oa_only: url.searchParams.get("oa_only") ?? undefined,
    author: url.searchParams.get("author") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    topic: url.searchParams.get("topic") ?? undefined,
    country: url.searchParams.get("country") ?? undefined,
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

  const { q, page, limit, year, year_min, year_max, source, oa_only, author, sort, topic, country } = parsed.data;

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

  stage = "cache-read";
  const hash = hashQuery(`${q}|topic=${topic}|country=${country ?? ""}`);

  let papers: PaperResult[] | null;
  try {
    papers = await getCachedResult(hash);
  } catch (err) {
    throw tag(err);
  }
  let fromCache = papers !== null;
  let sourcesQueried: SourceName[] = [];
  let sourcesFailed: SourceName[] = [];

  if (!papers) {
    stage = "aggregate";
    let out: Awaited<ReturnType<typeof aggregate>>;
    try {
      out = await aggregate({
        query: q,
        topic: topic as Topic,
        countryCode: country ?? null,
      });
    } catch (err) {
      throw tag(err);
    }
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
  if (year_min !== undefined) {
    filtered = filtered.filter((p) => p.year !== null && p.year >= year_min);
  }
  if (year_max !== undefined) {
    filtered = filtered.filter((p) => p.year !== null && p.year <= year_max);
  }
  if (oa_only) filtered = filtered.filter((p) => p.is_open_access);
  if (sourceFilter) filtered = filtered.filter((p) => p.source === sourceFilter);
  if (author) {
    const authorLower = author.toLowerCase();
    filtered = filtered.filter((p) =>
      p.authors.some((a) => a.toLowerCase().includes(authorLower)),
    );
  }
  filtered = sortResults(filtered, sort);

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

function sortResults(
  results: PaperResult[],
  sort: "relevance" | "citations_desc" | "year_desc" | "year_asc",
): PaperResult[] {
  if (sort === "relevance") return results;
  return results
    .map((paper, index) => ({ paper, index }))
    .sort((a, b) => {
      if (sort === "citations_desc") {
        const diff = b.paper.citation_count - a.paper.citation_count;
        return diff || a.index - b.index;
      }
      if (sort === "year_desc") {
        const ay = a.paper.year ?? -Infinity;
        const by = b.paper.year ?? -Infinity;
        const diff = by - ay;
        return diff || a.index - b.index;
      }
      const ay = a.paper.year ?? Infinity;
      const by = b.paper.year ?? Infinity;
      const diff = ay - by;
      return diff || a.index - b.index;
    })
    .map((x) => x.paper);
}

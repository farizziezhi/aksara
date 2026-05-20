import { createHash } from "node:crypto";
import { prisma } from "./db";
import { paperRowToResult } from "./paper-mapper";
import type { PaperResult } from "../types/paper";

const CACHE_TTL_MS =
  (Number(process.env.CACHE_TTL_HOURS) || 24) * 60 * 60 * 1000;

export function hashQuery(query: string): string {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized).digest("hex");
}

export async function getCachedResult(
  queryHash: string,
): Promise<PaperResult[] | null> {
  const now = new Date();
  const cached = await prisma.cachedQuery.findFirst({
    where: { query_hash: queryHash, expires_at: { gt: now } },
    include: {
      results: {
        orderBy: { rank: "asc" },
        include: {
          paper: { include: { authors: true } },
        },
      },
    },
  });
  if (!cached) return null;

  return cached.results.map((r) => paperRowToResult(r.paper));
}

export async function saveToCache(
  queryHash: string,
  queryRaw: string,
  results: PaperResult[],
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.cachedQuery.findUnique({
      where: { query_hash: queryHash },
      select: { id: true },
    });
    if (existing) {
      await tx.cachedQueryResult.deleteMany({ where: { query_id: existing.id } });
      await tx.cachedQuery.delete({ where: { id: existing.id } });
    }

    for (const r of results) {
      await tx.paper.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          title: r.title,
          abstract: r.abstract,
          year: r.year,
          doi: r.doi,
          pdf_url: r.pdf_url,
          source: r.source,
          citation_count: r.citation_count,
          is_open_access: r.is_open_access,
          authors: {
            create: r.authors.map((name) => ({ name })),
          },
        },
        update: {
          title: r.title,
          abstract: r.abstract,
          year: r.year,
          doi: r.doi,
          pdf_url: r.pdf_url,
          source: r.source,
          citation_count: r.citation_count,
          is_open_access: r.is_open_access,
        },
      });
    }

    const created = await tx.cachedQuery.create({
      data: {
        query_hash: queryHash,
        query_raw: queryRaw,
        result_count: results.length,
        expires_at: expiresAt,
      },
    });

    if (results.length) {
      await tx.cachedQueryResult.createMany({
        data: results.map((r, i) => ({
          query_id: created.id,
          paper_id: r.id,
          rank: i,
        })),
      });
    }
  });
}

export async function pruneExpiredCache(): Promise<number> {
  const result = await prisma.cachedQuery.deleteMany({
    where: { expires_at: { lt: new Date() } },
  });
  return result.count;
}

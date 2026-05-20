import { prisma } from "./db";
import { paperRowToResult } from "./paper-mapper";
import type { PaperResult } from "../types/paper";

const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "into",
  "using",
  "based",
  "study",
  "paper",
  "this",
  "that",
  "are",
  "was",
  "were",
  "has",
  "have",
  "had",
  "via",
  "over",
  "under",
]);

export function buildFtsQuery(title: string): string | null {
  const tokens = (title.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((t) => t.length >= 3)
    .filter((t) => !STOPWORDS.has(t))
    .slice(0, 6);
  if (!tokens.length) return null;
  return tokens.map((t) => `"${t.replace(/"/g, "")}"`).join(" OR ");
}

export async function findRelatedPapers(
  id: string,
  limit: number,
): Promise<PaperResult[] | null> {
  const paper = await prisma.paper.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!paper) return null;

  const ftsQuery = buildFtsQuery(paper.title);
  if (!ftsQuery) return [];

  const ids = await prisma.$queryRawUnsafe<{ paper_id: string }[]>(
    "SELECT paper_id FROM paper_fts WHERE paper_fts MATCH ? AND paper_id != ? LIMIT ?",
    ftsQuery,
    id,
    limit,
  );

  const order = ids.map((r) => r.paper_id);
  if (!order.length) return [];

  const rows = await prisma.paper.findMany({
    where: { id: { in: order } },
    include: { authors: true },
  });
  const byId = new Map(rows.map((r) => [r.id, paperRowToResult(r)]));
  return order.map((paperId) => byId.get(paperId)).filter((p): p is PaperResult => Boolean(p));
}

import { z } from "zod";
import type { NextRequest } from "next/server";
import { findRelatedPapers } from "../../../lib/related";
import {
  getClientIp,
  rateLimitHeaders,
  searchLimiter,
} from "../../../lib/rate-limit";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  id: z.string().trim().min(1, "id wajib diisi."),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = searchLimiter.check(ip);
  if (!rl.allowed) {
    return Response.json(
      {
        error: "RATE_LIMITED",
        message: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfterSec} detik.`,
      },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    id: url.searchParams.get("id") ?? "",
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      {
        error: "BAD_REQUEST",
        message: parsed.error.issues[0]?.message ?? "Parameter tidak valid.",
      },
      { status: 400, headers: rateLimitHeaders(rl) },
    );
  }

  const results = await findRelatedPapers(parsed.data.id, parsed.data.limit);
  if (results === null) {
    return Response.json(
      { error: "NOT_FOUND", message: "Paper tidak ditemukan." },
      { status: 404, headers: rateLimitHeaders(rl) },
    );
  }

  return Response.json({ results }, { headers: rateLimitHeaders(rl) });
}

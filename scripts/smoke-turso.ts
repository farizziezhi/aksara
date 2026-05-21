import { prisma } from "../lib/db";
import { hashQuery, saveToCache, getCachedResult } from "../lib/cache";
import type { PaperResult } from "../types/paper";

async function main() {
  const sample: PaperResult[] = [
    {
      id: "tursotest123",
      title: "Turso end-to-end test",
      abstract: "Smoke test for Turso libSQL deploy.",
      authors: ["Test Author"],
      year: 2026,
      doi: null,
      pdf_url: null,
      source: "OpenAlex",
      citation_count: 0,
      is_open_access: true,
    },
  ];

  const hash = hashQuery("turso smoke");
  console.log("hash:", hash);

  console.log("save...");
  await saveToCache(hash, "turso smoke", sample);

  console.log("read...");
  const got = await getCachedResult(hash);
  console.log("got:", got?.length, got?.[0]?.title);

  console.log("clean...");
  await prisma.cachedQuery.deleteMany({ where: { query_hash: hash } });
  await prisma.paper.deleteMany({ where: { id: "tursotest123" } });

  await prisma.$disconnect();
  console.log("ok");
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});

import { aggregate } from "../lib/aggregator";
import { getCachedResult, hashQuery, pruneExpiredCache, saveToCache } from "../lib/cache";
import { prisma } from "../lib/db";

async function main() {
  const query = process.argv[2] ?? "deep learning healthcare";
  const hash = hashQuery(query);
  console.log(`Query: "${query}"`);
  console.log(`Hash: ${hash.slice(0, 16)}…`);

  console.log("\n[1] miss expected:");
  const miss = await getCachedResult(hash);
  console.log(`  cache result: ${miss === null ? "null (miss)" : `${miss.length} papers`}`);

  console.log("\n[2] aggregate live:");
  const t0 = Date.now();
  const out = await aggregate({ query, perSourceLimit: 5 });
  console.log(`  fetched ${out.results.length} papers in ${Date.now() - t0}ms (failed: ${out.sources_failed.join(",") || "none"})`);

  console.log("\n[3] save to cache:");
  await saveToCache(hash, query, out.results.slice(0, 10));
  console.log("  saved.");

  console.log("\n[4] hit expected:");
  const hit = await getCachedResult(hash);
  console.log(`  cache result: ${hit?.length ?? "null"} papers`);
  if (hit?.length) {
    console.log(`  rank0: ${hit[0].title.slice(0, 80)} (${hit[0].source})`);
    console.log(`  authors: ${hit[0].authors.slice(0, 3).join(", ")}`);
  }

  console.log("\n[5] save again (overwrite path):");
  await saveToCache(hash, query, out.results.slice(0, 3));
  const re = await getCachedResult(hash);
  console.log(`  cache result after overwrite: ${re?.length ?? "null"} papers`);

  console.log("\n[6] prune:");
  const pruned = await pruneExpiredCache();
  console.log(`  pruned ${pruned} expired rows`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});

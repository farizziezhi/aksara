import { aggregate } from "../lib/aggregator";

async function main() {
  const query = process.argv[2] ?? "machine learning healthcare";
  console.log(`Query: "${query}"`);
  const t0 = Date.now();
  const out = await aggregate({ query, perSourceLimit: 10 });
  const dt = Date.now() - t0;

  console.log(`\nDone in ${dt}ms`);
  console.log("queried:", out.sources_queried);
  console.log("failed:", out.sources_failed);
  if (out.errors.length) {
    console.log("errors:");
    for (const e of out.errors) console.log(`  - ${e.source}: ${e.message}`);
  }
  console.log(`total deduped+ranked: ${out.results.length}`);
  console.log("\nTop 5:");
  for (const p of out.results.slice(0, 5)) {
    console.log("---");
    console.log(`[${p.source}] ${p.title.slice(0, 80)}`);
    console.log(`  doi=${p.doi} year=${p.year} cites=${p.citation_count}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

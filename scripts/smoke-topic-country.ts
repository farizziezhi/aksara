import { searchArXiv } from "../lib/sources/arxiv";
import { aggregate } from "../lib/aggregator";

async function main() {
  console.log("\n=== arXiv ID direct ===");
  const r1 = await searchArXiv("2303.15563");
  console.log(`results=${r1.length}`);
  if (r1[0]) console.log(`title: ${r1[0].title.slice(0, 100)}`);

  console.log("\n=== aggregate topic=medicine country=ID ===");
  const r2 = await aggregate({
    query: "rice diabetes",
    topic: "medicine",
    countryCode: "ID",
  });
  console.log(`queried=${r2.sources_queried.join(",")}`);
  console.log(`failed=${r2.sources_failed.join(",") || "(none)"}`);
  console.log(`total=${r2.results.length}`);
  console.log("top 3:");
  for (const p of r2.results.slice(0, 3)) {
    console.log(`  [${p.source}] ${p.title.slice(0, 80)} (year=${p.year})`);
  }

  console.log("\n=== aggregate topic=engineering country=ID ===");
  const r3 = await aggregate({
    query: "renewable energy",
    topic: "engineering",
    countryCode: "ID",
  });
  console.log(`queried=${r3.sources_queried.join(",")}`);
  console.log(`total=${r3.results.length}`);
  for (const p of r3.results.slice(0, 3)) {
    console.log(`  [${p.source}] ${p.title.slice(0, 80)} (year=${p.year})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

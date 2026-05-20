import { searchOpenAlex } from "../lib/sources/openalex";
import { searchCORE } from "../lib/sources/core";
import { searchArXiv } from "../lib/sources/arxiv";
import { searchDOAJ } from "../lib/sources/doaj";
import { searchCrossref } from "../lib/sources/crossref";
import { searchEuropePMC } from "../lib/sources/europepmc";
import { getCitationCount } from "../lib/sources/opencitations";
import { getOpenAccessLink } from "../lib/sources/unpaywall";
import type { PaperResult, SourceName } from "../types/paper";

type RunFn = () => Promise<PaperResult[] | string | null>;

async function run(name: SourceName | "Unpaywall" | "OpenCitations", fn: RunFn) {
  process.stdout.write(`\n=== ${name} ===\n`);
  const t0 = Date.now();
  try {
    const out = await fn();
    const dt = Date.now() - t0;
    if (Array.isArray(out)) {
      console.log(`  ok in ${dt}ms — ${out.length} results`);
      const sample = out[0];
      if (sample) {
        console.log(`  sample: ${sample.title.slice(0, 80)}`);
        console.log(`    doi=${sample.doi} year=${sample.year} oa=${sample.is_open_access}`);
        console.log(`    pdf=${sample.pdf_url ?? "(none)"}`);
      }
    } else {
      console.log(`  ok in ${dt}ms — value: ${out ?? "(null)"}`);
    }
  } catch (err) {
    const dt = Date.now() - t0;
    console.log(`  FAIL in ${dt}ms — ${(err as Error).message}`);
  }
}

async function main() {
  const query = process.argv[2] ?? "machine learning healthcare";
  const sampleDoi = process.argv[3] ?? "10.1038/nature12373";
  console.log(`Query: "${query}" | DOI for Unpaywall: ${sampleDoi}`);

  await run("OpenAlex", () => searchOpenAlex(query, 3));
  await run("CORE", () => searchCORE(query, 3));
  await run("arXiv", () => searchArXiv(query, 3));
  await run("DOAJ", () => searchDOAJ(query, 3));
  await run("Crossref", () => searchCrossref(query, 3));
  await run("EuropePMC", () => searchEuropePMC(query, 3));
  await run("OpenCitations", async () => {
    const c = await getCitationCount(sampleDoi);
    return c === null ? "(no count)" : `count=${c}`;
  });
  await run("Unpaywall", async () => (await getOpenAccessLink(sampleDoi)) ?? "(no OA link)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

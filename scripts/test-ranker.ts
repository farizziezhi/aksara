import { rank } from "../lib/ranker";
import type { PaperResult, SourceName } from "../types/paper";

let failed = 0;
function expect(name: string, cond: boolean, detail?: string) {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failed++;
    console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`);
  }
}

function p(opts: Partial<PaperResult> & { id: string; title: string; source: SourceName }): PaperResult {
  return {
    abstract: null,
    authors: [],
    year: null,
    doi: null,
    pdf_url: null,
    citation_count: 0,
    is_open_access: true,
    ...opts,
  };
}

console.log("Ranker tests");

const NOW = new Date("2026-01-01");

{
  const exact = p({ id: "1", title: "machine learning healthcare", source: "OpenAlex", citation_count: 5 });
  const partial = p({ id: "2", title: "deep learning for healthcare", source: "OpenAlex", citation_count: 5000 });
  const out = rank([partial, exact], { query: "machine learning healthcare", now: NOW });
  expect("exact title beats high-citation partial", out[0].id === "1", `top=${out[0].id}`);
}

{
  const titleHit = p({ id: "1", title: "Quantum machine learning", source: "OpenAlex" });
  const abstractHit = p({ id: "2", title: "Some unrelated title", abstract: "uses machine learning techniques", source: "OpenAlex" });
  const out = rank([abstractHit, titleHit], { query: "machine learning", now: NOW });
  expect("title match beats abstract match", out[0].id === "1");
}

{
  const a = p({ id: "1", title: "neural networks", source: "OpenAlex", citation_count: 100, year: 2020 });
  const b = p({ id: "2", title: "neural networks", source: "OpenAlex", citation_count: 10000, year: 2020 });
  const out = rank([a, b], { query: "neural networks", now: NOW });
  expect("higher citations win on tie", out[0].id === "2");
}

{
  const old = p({ id: "1", title: "neural networks", source: "OpenAlex", citation_count: 50, year: 1995 });
  const recent = p({ id: "2", title: "neural networks", source: "OpenAlex", citation_count: 50, year: 2024 });
  const out = rank([old, recent], { query: "neural networks", now: NOW });
  expect("recent wins on tie", out[0].id === "2");
}

{
  const out = rank([], { query: "anything", now: NOW });
  expect("empty input ok", out.length === 0);
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nall tests passed");

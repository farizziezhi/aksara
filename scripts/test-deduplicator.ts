import { deduplicate, normalizeTitle, similarity } from "../lib/deduplicator";
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

console.log("Deduplicator tests");

{
  const sim = similarity(
    normalizeTitle("Machine Learning in Healthcare: A Review"),
    normalizeTitle("machine learning in healthcare a review"),
  );
  expect("similarity casing/punct", sim === 1, `sim=${sim}`);
}

{
  const sim = similarity(
    normalizeTitle("Deep learning for image classification"),
    normalizeTitle("Deep learning for image classifications"),
  );
  expect("similarity near-dup high", sim >= 0.85, `sim=${sim.toFixed(3)}`);
}

{
  const sim = similarity(
    normalizeTitle("Quantum computing"),
    normalizeTitle("Convolutional neural networks"),
  );
  expect("similarity unrelated low", sim < 0.5, `sim=${sim.toFixed(3)}`);
}

{
  const a = p({ id: "1", title: "Paper A", source: "OpenAlex", doi: "10.1/X", citation_count: 10 });
  const b = p({ id: "2", title: "Paper A different style", source: "CORE", doi: "https://doi.org/10.1/X", citation_count: 25, abstract: "abs" });
  const out = deduplicate([a, b]);
  expect("DOI dedup → 1", out.length === 1);
  expect("DOI dedup keeps abstract", out[0].abstract === "abs");
  expect("DOI dedup max cites", out[0].citation_count === 25);
}

{
  const a = p({ id: "1", title: "Deep learning for medical imaging", source: "OpenAlex" });
  const b = p({ id: "2", title: "Deep learning for medical imaging", source: "arXiv" });
  const out = deduplicate([a, b]);
  expect("title dedup exact match", out.length === 1);
}

{
  const a = p({ id: "1", title: "Deep learning for medical imaging", source: "OpenAlex" });
  const b = p({ id: "2", title: "Deep Learning for Medical Imaging.", source: "DOAJ" });
  const out = deduplicate([a, b]);
  expect("title dedup punctuation/case", out.length === 1);
}

{
  const a = p({ id: "1", title: "Quantum computing applications", source: "OpenAlex" });
  const b = p({ id: "2", title: "Convolutional neural networks", source: "arXiv" });
  const out = deduplicate([a, b]);
  expect("distinct titles preserved", out.length === 2);
}

{
  const a = p({ id: "1", title: "X", source: "OpenAlex", doi: "10.1/X" });
  const b = p({ id: "2", title: "Y similar enough title", source: "CORE" });
  const c = p({ id: "3", title: "Y similar enough title.", source: "arXiv" });
  const out = deduplicate([a, b, c]);
  expect("DOI + non-DOI title dedup mix", out.length === 2, `len=${out.length}`);
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nall tests passed");

import { toApa, toBibtex, citationKey, formatApaAuthors } from "../lib/citation";
import type { PaperResult } from "../types/paper";

let failed = 0;
function expect(name: string, cond: boolean, detail?: string) {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failed++;
    console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`);
  }
}

function paper(overrides: Partial<PaperResult> = {}): PaperResult {
  return {
    id: "p1",
    title: "Neural Approaches & Open_Access {Discovery}",
    abstract: null,
    authors: ["Jane Alice Smith", "Luis Garcia"],
    year: 2023,
    doi: "10.1234/example.5678",
    pdf_url: "https://example.test/paper.pdf",
    source: "OpenAlex",
    citation_count: 12,
    is_open_access: true,
    ...overrides,
  };
}

console.log("Citation tests");

expect("citation key uses lastname year title", citationKey(paper()) === "smith2023neural");
expect("citation key uses nd when no year", citationKey(paper({ year: null })) === "smithndneural");
expect("APA two authors", formatApaAuthors(["Jane Alice Smith", "Luis Garcia"]) === "Smith, J. A., & Garcia, L.");
expect("APA no date", toApa(paper({ year: null })).includes("(n.d.)."));
expect("APA DOI URL", toApa(paper()).endsWith("https://doi.org/10.1234/example.5678"));

const many = Array.from({ length: 22 }, (_, i) => `Author ${i + 1} Last${i + 1}`);
const manyApa = formatApaAuthors(many);
expect("APA 21+ author ellipsis", manyApa.includes("..."));
expect("APA 21+ includes final author", manyApa.includes("Last22"));

const bib = toBibtex(paper());
expect("BibTeX uses misc", bib.startsWith("@misc{smith2023neural,"));
expect("BibTeX wraps title", bib.includes("title = {{Neural Approaches"));
expect("BibTeX escapes ampersand", bib.includes("\\&"));
expect("BibTeX escapes underscore", bib.includes("\\_"));
expect("BibTeX has doi", bib.includes("doi = {10.1234/example.5678}"));

const noDoi = toBibtex(paper({ doi: null }));
expect("BibTeX without DOI uses url", noDoi.includes("url = {https://example.test/paper.pdf}"));

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nall tests passed");

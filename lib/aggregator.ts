import type { PaperResult, SourceName } from "../types/paper";
import { searchOpenAlex } from "./sources/openalex";
import { searchCORE } from "./sources/core";
import { searchArXiv } from "./sources/arxiv";
import { searchDOAJ } from "./sources/doaj";
import { searchCrossref } from "./sources/crossref";
import { searchEuropePMC } from "./sources/europepmc";
import { searchPubMed } from "./sources/pubmed";
import { enrichCitationCounts } from "./sources/opencitations";
import { deduplicate } from "./deduplicator";
import { rank } from "./ranker";

export interface AggregateOptions {
  query: string;
  perSourceLimit?: number;
  sources?: SourceName[];
  countryCode?: string | null;
}

export interface AggregateResult {
  results: PaperResult[];
  sources_queried: SourceName[];
  sources_failed: SourceName[];
  errors: { source: SourceName; message: string }[];
}

type SourceFn = (q: string, limit: number) => Promise<PaperResult[]>;

const DEFAULT_SOURCES: SourceName[] = [
  "OpenAlex",
  "CORE",
  "arXiv",
  "DOAJ",
  "Crossref",
  "EuropePMC",
  "PubMed",
];

export async function aggregate(opts: AggregateOptions): Promise<AggregateResult> {
  const limit = opts.perSourceLimit ?? 25;
  const country = opts.countryCode ?? null;

  const registry: Record<Exclude<SourceName, "Unpaywall">, SourceFn> = {
    OpenAlex: (q, l) => searchOpenAlex(q, l, { countryCode: country }),
    CORE: searchCORE,
    arXiv: searchArXiv,
    DOAJ: (q, l) => searchDOAJ(q, l, { countryCode: country }),
    Crossref: searchCrossref,
    EuropePMC: searchEuropePMC,
    PubMed: searchPubMed,
  };

  const requested = (opts.sources ?? DEFAULT_SOURCES).filter(
    (s): s is keyof typeof registry => s in registry,
  );

  const settled = await Promise.allSettled(
    requested.map((s) => registry[s](opts.query, limit)),
  );

  const all: PaperResult[] = [];
  const queried: SourceName[] = [];
  const failed: SourceName[] = [];
  const errors: { source: SourceName; message: string }[] = [];

  settled.forEach((res, i) => {
    const source = requested[i];
    if (res.status === "fulfilled") {
      queried.push(source);
      all.push(...res.value);
    } else {
      failed.push(source);
      errors.push({
        source,
        message: res.reason instanceof Error ? res.reason.message : String(res.reason),
      });
    }
  });

  const merged = deduplicate(all);
  await enrichCitationCounts(merged, { budgetMs: 2500, concurrency: 6 });
  const ordered = rank(merged, { query: opts.query });

  return { results: ordered, sources_queried: queried, sources_failed: failed, errors };
}

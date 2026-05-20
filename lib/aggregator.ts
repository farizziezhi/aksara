import type { PaperResult, SourceName } from "../types/paper";
import { searchOpenAlex } from "./sources/openalex";
import { searchCORE } from "./sources/core";
import { searchArXiv } from "./sources/arxiv";
import { searchDOAJ } from "./sources/doaj";
import { searchCrossref } from "./sources/crossref";
import { searchEuropePMC } from "./sources/europepmc";
import { enrichCitationCounts } from "./sources/opencitations";
import { deduplicate } from "./deduplicator";
import { rank } from "./ranker";

export interface AggregateOptions {
  query: string;
  perSourceLimit?: number;
  sources?: SourceName[];
}

export interface AggregateResult {
  results: PaperResult[];
  sources_queried: SourceName[];
  sources_failed: SourceName[];
  errors: { source: SourceName; message: string }[];
}

type SourceFn = (q: string, limit: number) => Promise<PaperResult[]>;

const REGISTRY: Record<Exclude<SourceName, "Unpaywall">, SourceFn> = {
  OpenAlex: searchOpenAlex,
  CORE: searchCORE,
  arXiv: searchArXiv,
  DOAJ: searchDOAJ,
  Crossref: searchCrossref,
  EuropePMC: searchEuropePMC,
};

const DEFAULT_SOURCES: SourceName[] = [
  "OpenAlex",
  "CORE",
  "arXiv",
  "DOAJ",
  "Crossref",
  "EuropePMC",
];

export async function aggregate(opts: AggregateOptions): Promise<AggregateResult> {
  const limit = opts.perSourceLimit ?? 25;
  const requested = (opts.sources ?? DEFAULT_SOURCES).filter(
    (s): s is keyof typeof REGISTRY => s in REGISTRY,
  );

  const settled = await Promise.allSettled(
    requested.map((s) => REGISTRY[s](opts.query, limit)),
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

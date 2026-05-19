import { fetchJson, normalizeDoi, SourceFetchError } from "./_shared";

interface UnpaywallOaLocation {
  url_for_pdf?: string | null;
  url?: string | null;
  is_best?: boolean;
}

interface UnpaywallResponse {
  doi?: string;
  is_oa?: boolean;
  best_oa_location?: UnpaywallOaLocation | null;
  oa_locations?: UnpaywallOaLocation[];
}

const SOURCE = "Unpaywall" as const;

export async function getOpenAccessLink(doi: string): Promise<string | null> {
  const email = process.env.UNPAYWALL_EMAIL;
  if (!email || email === "your@email.com") {
    throw new SourceFetchError(SOURCE, "UNPAYWALL_EMAIL not configured");
  }

  const normalized = normalizeDoi(doi);
  const url = new URL(`https://api.unpaywall.org/v2/${encodeURIComponent(normalized)}`);
  url.searchParams.set("email", email);

  let data: UnpaywallResponse;
  try {
    data = await fetchJson<UnpaywallResponse>(url.toString(), {
      source: SOURCE,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    if (err instanceof SourceFetchError && err.status === 404) return null;
    throw err;
  }

  if (!data.is_oa) return null;
  const best = data.best_oa_location;
  if (best?.url_for_pdf) return best.url_for_pdf;
  if (best?.url) return best.url;
  for (const loc of data.oa_locations ?? []) {
    if (loc.url_for_pdf) return loc.url_for_pdf;
  }
  return data.oa_locations?.[0]?.url ?? null;
}

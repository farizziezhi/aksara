import { createHash } from "node:crypto";

export const DEFAULT_TIMEOUT_MS = Number(process.env.MAX_API_TIMEOUT_MS) || 5000;

export class SourceFetchError extends Error {
  constructor(
    public readonly source: string,
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(`[${source}] ${message}`);
    this.name = "SourceFetchError";
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { source: string; timeoutMs?: number },
): Promise<T> {
  const { source, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new SourceFetchError(source, "network or timeout", undefined, err);
  }
  if (!res.ok) {
    throw new SourceFetchError(source, `HTTP ${res.status}`, res.status);
  }
  try {
    return (await res.json()) as T;
  } catch (err) {
    throw new SourceFetchError(source, "invalid JSON", res.status, err);
  }
}

export async function fetchText(
  url: string,
  init: RequestInit & { source: string; timeoutMs?: number },
): Promise<string> {
  const { source, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new SourceFetchError(source, "network or timeout", undefined, err);
  }
  if (!res.ok) {
    throw new SourceFetchError(source, `HTTP ${res.status}`, res.status);
  }
  return res.text();
}

export function paperIdFromDoi(doi: string): string {
  const normalized = normalizeDoi(doi);
  return createHash("sha256").update(`doi:${normalized}`).digest("hex").slice(0, 24);
}

export function paperIdFromTitle(title: string): string {
  const normalized = title.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(`title:${normalized}`).digest("hex").slice(0, 24);
}

export function normalizeDoi(doi: string): string {
  return doi
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:/, "");
}

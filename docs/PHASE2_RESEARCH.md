# Phase 2 Source Research

## GARUDA

Status: defer direct integration.

Findings:
- Current portal: https://garuda.kemdiktisaintek.go.id/
- Search UI exists at `https://garuda.kemdiktisaintek.go.id/documents/?q=<keyword>&select=&pub=&pdf=`.
- Results are HTML pages, not official JSON/REST API responses.
- Search UI exposes fields useful for a scraper: title, authors, journal/conference, year, DOI when available, source URL, and download links when available.
- No official public REST API documentation found.
- No verified OAI-PMH, RSS, or sitemap-based API endpoint found.
- No public rate-limit policy found.

Decision:
Do not implement GARUDA client yet. Integration needs either official API confirmation or a scraper design with conservative rate limits, robots/terms review, retry/backoff, and HTML parser tests.

## Neliti

Status: defer direct integration.

Findings:
- Public site: https://www.neliti.com
- Fetches to site/search/publication pages returned HTTP 403 in automated environment.
- No official public REST/JSON API documentation found.
- No verified OAI-PMH, RSS, or sitemap endpoint found.
- Field availability cannot be verified from API docs because no API docs were found.

Decision:
Do not implement Neliti client yet. 403 response is a strong signal not to automate scraping without permission or documented API terms.

## Recommendation

Phase 2 should ship citation export and related-paper recommendation now. GARUDA/Neliti remain research-only until official API or allowed scraping path exists.

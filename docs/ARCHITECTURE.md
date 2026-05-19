# ARCHITECTURE.md
# System Architecture

## Prinsip Utama

- **Monolith sederhana** — satu Next.js app, tidak ada microservices
- **Modular utilities** — fungsi-fungsi kecil yang bisa ditest secara independen
- **No over-engineering** — tidak ada abstraction layer yang tidak perlu

---

## Tech Stack

| Layer     | Teknologi           | Alasan                                   |
|-----------|---------------------|------------------------------------------|
| Frontend  | Next.js + React     | SSR + routing terintegrasi               |
| Styling   | Tailwind CSS        | Utility-first, cepat                     |
| Language  | TypeScript          | Type safety, maintainability             |
| Backend   | Next.js API Routes  | Satu codebase, tidak perlu server terpisah |
| Database  | SQLite + Prisma     | Ringan, tidak perlu server DB            |
| Search    | SQLite FTS5         | Full-text search tanpa dependensi tambahan |

---

## Folder Structure

```
/
├── app/
│   ├── page.tsx              # Homepage + search UI
│   ├── layout.tsx
│   └── api/
│       └── search/
│           └── route.ts      # Search API endpoint
│
├── lib/
│   ├── aggregator.ts         # Orchestrate semua API calls
│   ├── normalizer.ts         # Normalize response ke PaperResult
│   ├── deduplicator.ts       # Deduplikasi by DOI & title
│   ├── ranker.ts             # Ranking hasil pencarian
│   ├── cache.ts              # Read/write cache SQLite
│   └── sources/
│       ├── openalex.ts
│       ├── core.ts
│       ├── unpaywall.ts
│       ├── arxiv.ts
│       └── doaj.ts
│
├── components/
│   ├── SearchBar.tsx
│   ├── ResultCard.tsx
│   ├── FilterPanel.tsx
│   ├── LoadingState.tsx
│   └── ErrorState.tsx
│
├── prisma/
│   └── schema.prisma
│
├── types/
│   └── paper.ts              # PaperResult interface
│
└── .env.local                # API keys & config
```

---

## Request Flow Diagram

```
Browser
  │
  ├─ GET /                      → Next.js page (UI)
  │
  └─ GET /api/search?q=...      → Next.js API Route
          │
          ├── 1. Validate input
          ├── 2. Check cache (SQLite)
          │       ├── HIT  → return immediately
          │       └── MISS → continue
          ├── 3. Call aggregator
          │       ├── OpenAlex  (parallel, timeout 5s)
          │       ├── CORE      (parallel, timeout 5s)
          │       ├── Unpaywall (parallel, timeout 5s)
          │       ├── arXiv     (parallel, timeout 5s)
          │       └── DOAJ      (parallel, timeout 5s)
          ├── 4. Normalize responses → PaperResult[]
          ├── 5. Deduplicate
          ├── 6. Rank
          ├── 7. Save to cache
          └── 8. Return JSON response
```

---

## Data Flow: Normalized Paper Model

Semua API response dikonversi ke interface ini sebelum diproses lebih lanjut:

```typescript
// types/paper.ts
interface PaperResult {
  id: string;               // internal ID (hash dari DOI atau title)
  title: string;
  abstract: string | null;
  authors: string[];
  year: number | null;
  doi: string | null;
  pdf_url: string | null;
  source: SourceName;       // "OpenAlex" | "CORE" | "arXiv" | "Unpaywall" | "DOAJ"
  citation_count: number;
  is_open_access: boolean;
  fetched_at: Date;
}

type SourceName = "OpenAlex" | "CORE" | "arXiv" | "Unpaywall" | "DOAJ";
```

---

## Error Handling Strategy

| Kondisi                     | Behavior                                          |
|-----------------------------|---------------------------------------------------|
| Semua API timeout/gagal     | Return HTTP 503 + pesan error yang jelas          |
| Sebagian API gagal          | Return partial result + info sumber yang berhasil |
| Input tidak valid           | Return HTTP 400 + pesan validasi                  |
| Cache error                 | Log error, lanjut query API (non-blocking)        |
| API key tidak valid         | Log error, skip sumber tersebut                   |

---

## Caching Strategy

- **Engine:** SQLite via Prisma
- **TTL default:** 24 jam
- **Key:** hash dari query string yang dinormalisasi (lowercase, trimmed)
- **Behavior saat expired:** query ulang API, update cache
- **Behavior saat cache error:** skip cache, query API langsung (fail-open)

---

## Performance Targets (MVP)

| Metrik                         | Target      |
|--------------------------------|-------------|
| Response time (cache hit)      | < 200ms     |
| Response time (cache miss)     | < 6 detik   |
| Debounce delay search input    | 400ms       |
| Results per page               | 10          |

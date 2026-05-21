# Aksara

> Pencarian terpadu paper open-access. Bersih, cepat, gratis.

<p align="center">
  <a href="https://aksara-ivory-theta.vercel.app/"><img alt="Live" src="https://img.shields.io/badge/live-aksara--ivory--theta.vercel.app-0098f2?style=flat-square"></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs">
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=000">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=fff">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma">
  <img alt="Turso" src="https://img.shields.io/badge/Turso-libSQL-4ff8d2?style=flat-square&logo=turso&logoColor=000">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=fff">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-000?style=flat-square">
</p>

<p align="center">
  <strong><a href="https://aksara-ivory-theta.vercel.app/">Live demo</a></strong>
  ·
  <a href="#fitur">Fitur</a>
  ·
  <a href="#arsitektur">Arsitektur</a>
  ·
  <a href="#mulai-cepat">Mulai cepat</a>
  ·
  <a href="#deploy">Deploy</a>
</p>

---

## Mengapa Aksara

Mencari paper open-access biasanya berarti membuka 5 tab: OpenAlex, arXiv, DOAJ, Crossref, Europe PMC, dan menggabungkan hasilnya secara manual. Aksara menjadikannya satu kotak pencarian: hasil di-deduplikasi berdasarkan DOI dan kemiripan judul, di-rank dengan skor relevansi + sitasi + recency, lalu di-cache 24 jam agar pencarian berikutnya instan.

## Fitur

- **6 sumber data** dalam satu pencarian — OpenAlex, CORE, arXiv, DOAJ, Crossref, Europe PMC
- **Enrichment via Unpaywall + OpenCitations** untuk OA link & citation count
- **Ranking pintar** — exact title match, token coverage, log citations, recency, OA bonus
- **Deduplication** — DOI exact + title bigram similarity (≥ 0.85)
- **Cache SQLite + libSQL (Turso)** dengan TTL 24 jam, hash query SHA-256
- **Related papers** via SQLite FTS5 — tanpa external API call
- **Citation export** — BibTeX & APA, copy-to-clipboard
- **Filter lengkap** — year range, author, source, OA-only, sort (relevance / citations / year)
- **Rate limit 30 req/menit per IP** — anti-abuse, headers `X-RateLimit-*`
- **Accessible** — semantic HTML, `aria-live`, focus rings, keyboard shortcuts (`⌘/Ctrl+K`)
- **Responsive** — mobile-first, sticky header, hamburger nav
- **Acctual design tokens** — light mode, Sky Teal accent, Inter + Caveat
- **Vercel Analytics + Speed Insights** built-in

## Arsitektur

```
┌─────────────┐   debounce   ┌──────────────────┐
│  Browser    │ ───────────▶ │  /api/search     │
│  (Next 16)  │              │  rate-limit  ✓   │
└─────────────┘              │  zod validate ✓  │
                              └────────┬─────────┘
                                       │
                            cache hit  │  cache miss
                  ┌────────────────────┼────────────────────┐
                  ▼                                          ▼
          ┌──────────────┐                        ┌──────────────────────┐
          │ Turso libSQL │                        │  aggregate()         │
          │ Paper / FTS5 │◀── save fire-and-forget│  Promise.allSettled  │
          └──────────────┘                        ├──────────────────────┤
                                                   │ OpenAlex   Crossref │
                                                   │ CORE       EuropePMC│
                                                   │ arXiv      DOAJ     │
                                                   └────────┬────────────┘
                                                            │
                                                            ▼
                                                  deduplicate → rank →
                                                  enrich (OpenCitations)
```

**Galur:**

1. Client `SearchBar` debounce 400ms → `/api/search`.
2. Rate limiter cek IP (fixed window, 30/menit).
3. Zod validasi: `q`, `year_min`, `year_max`, `author`, `source`, `oa_only`, `sort`.
4. Hash query → cek cache. Hit = pakai. Miss = aggregate paralel ke 6 sumber.
5. Hasil di-deduplikasi (DOI + similarity), di-rank, citation count di-enrich via OpenCitations.
6. Save ke Turso (fire-and-forget). Filter + sort + paginate untuk respons.

## Tech stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 + Acctual tokens |
| Type | TypeScript 5 |
| Validasi | Zod 4 |
| ORM | Prisma 7 dengan libSQL adapter |
| Database | Turso (libSQL serverless, SQLite kompatibel + FTS5) |
| Hosting | Vercel (Hobby, free tier) |
| Observability | Vercel Web Analytics + Speed Insights |

## Sumber data

| Sumber | Peran | Auth | Kuota |
|---|---|---|---|
| OpenAlex | Pencarian utama, abstract via inverted index | Polite mailto | Tinggi |
| CORE | Aggregator OA + full-text | API key | 10/menit |
| arXiv | Preprint | — | Soft (kirim mailto) |
| DOAJ | Directory OA, kurasi ketat | — | Wajar |
| Crossref | Metadata DOI + citation count | Polite mailto | Polite pool |
| Europe PMC | Life sciences, full-text | — | — |
| Unpaywall | OA link lookup | Email | — |
| OpenCitations | Citation count enrichment | — | — |

## Mulai cepat

Prasyarat: Node 20+, pnpm 10+.

```bash
git clone https://github.com/farizziezhi/aksara.git
cd aksara
pnpm install
cp .env.example .env.local

# isi .env.local — DATABASE_URL untuk lokal cukup pakai SQLite file
# CORE_API_KEY (opsional, daftar di https://core.ac.uk/services/api)
# UNPAYWALL_EMAIL (wajib, email valid)

pnpm exec prisma generate
pnpm exec prisma migrate deploy

pnpm dev
# http://localhost:3000
```

Migrasi ke Turso (libSQL) tidak pakai `prisma migrate` karena Prisma CLI menolak skema `libsql://`. Gunakan skrip yang disediakan:

```bash
DATABASE_URL="libsql://...turso.io" \
DATABASE_AUTH_TOKEN="..." \
pnpm dlx tsx scripts/turso-migrate.ts
```

## Tes & smoke

```bash
pnpm dlx tsx scripts/test-citation.ts
pnpm dlx tsx scripts/test-deduplicator.ts
pnpm dlx tsx scripts/test-ranker.ts
pnpm dlx tsx scripts/test-rate-limit.ts

pnpm dlx tsx scripts/smoke-source.ts "machine learning healthcare"
pnpm dlx tsx scripts/smoke-aggregator.ts "graph neural network"
```

## Deploy

Lihat [`docs/DEPLOY.md`](./docs/DEPLOY.md). Singkatnya: GitHub → Vercel → Turso → set 7 env vars → deploy.

```text
DATABASE_URL=libsql://<...>.turso.io
DATABASE_AUTH_TOKEN=<token>
CORE_API_KEY=<key>
UNPAYWALL_EMAIL=<email>
CACHE_TTL_HOURS=24
RATE_LIMIT_SEARCH_PER_MIN=30
MAX_API_TIMEOUT_MS=5000
```

## Keamanan

Detail keamanan tidak dipublikasikan.

## Struktur

```
app/                  Next.js App Router (UI + API routes)
  api/search          Search endpoint
  api/related         Related papers endpoint
  about               Halaman tentang
  icon, opengraph     Generated icon + OG image
components/           UI components (header, footer, cards, filters, ...)
lib/                  Domain logic (sources, cache, ranker, dedup, rate-limit)
  sources/            Adapter per data source
prisma/               Schema + migrations + libSQL adapter wiring
scripts/              Tests + smoke + Turso migrate/verify
types/                API + paper shape
docs/                 Spec, deploy, architecture, phase 2 research
```

## Skrip

```bash
pnpm dev          # next dev
pnpm build        # next build
pnpm start        # next start
pnpm lint         # eslint
```

## Kontribusi

Issue dan PR diterima. Untuk perubahan besar, buka issue terlebih dahulu.

## Pembuat

Dibangun oleh **[Farizzi Ezhi](https://github.com/farizziezhi)** — eksperimen pencarian terpadu untuk literatur akademik open-access.

## Lisensi

[MIT](./LICENSE)

---

<p align="center">
  <em>built for curious minds.</em>
</p>

# TASKS.md
# Development Tasks

Urutan task mengikuti Development Priority di RULES.md:
Search logic → API integration → Deduplication → Ranking → Cache → UI

---

## 0. Pre-Development Checklist

Selesaikan ini sebelum mulai coding:

- [ ] Daftar CORE API Key di https://core.ac.uk/services/api
- [ ] Siapkan email untuk Unpaywall parameter
- [ ] Investigasi GARUDA & Neliti API availability (untuk Phase 2)
- [ ] Setup file `.env.local` dengan semua keys yang diperlukan

**Template `.env.local`:**
```
DATABASE_URL="file:./dev.db"
CORE_API_KEY="your_core_api_key"
UNPAYWALL_EMAIL="your@email.com"
```

---

## 1. Project Setup

- [ ] Initialize Next.js project dengan TypeScript (`npx create-next-app@latest --typescript`)
- [ ] Setup Tailwind CSS
- [ ] Install dan setup Prisma (`npm install prisma @prisma/client`)
- [ ] Install dependensi tambahan (`npm install zod`)

---

## 2. Types & Shared Models

- [ ] Buat `types/paper.ts` — interface `PaperResult` dan type `SourceName`
- [ ] Buat `types/api.ts` — interface request/response API

---

## 3. Database

- [ ] Tulis Prisma schema (`prisma/schema.prisma`) — lihat DATABASE.md
- [ ] Jalankan migration awal (`npx prisma migrate dev`)
- [ ] Setup SQLite FTS5 virtual table via raw SQL migration
- [ ] Test koneksi database

---

## 4. External API Clients

**PENTING:** Gunakan Fetch API native (built-in di Node.js 18+), jangan axios.

Contoh fetch dengan timeout:
```typescript
const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

### OpenAlex
- [ ] Buat `lib/sources/openalex.ts`
- [ ] Implementasi fungsi `searchOpenAlex(query: string): Promise<PaperResult[]>`
- [ ] Gunakan fetch native dengan timeout 5 detik
- [ ] Parse response dan map ke `PaperResult`
- [ ] Handle error & timeout gracefully
- [ ] Test dengan query sampel

### CORE
- [ ] Buat `lib/sources/core.ts`
- [ ] Implementasi fungsi `searchCORE(query: string): Promise<PaperResult[]>`
- [ ] Gunakan fetch native dengan timeout 5 detik
- [ ] Tambahkan API Key dari env di header
- [ ] Parse response dan map ke `PaperResult`
- [ ] Handle error & timeout gracefully

### Unpaywall
- [ ] Buat `lib/sources/unpaywall.ts`
- [ ] Implementasi fungsi `getOpenAccessLink(doi: string): Promise<string | null>`
- [ ] Gunakan fetch native dengan timeout 5 detik
- [ ] Tambahkan email parameter dari env
- [ ] Handle 404 (DOI tidak ditemukan di Unpaywall)

### arXiv
- [ ] Buat `lib/sources/arxiv.ts`
- [ ] Implementasi fungsi `searchArXiv(query: string): Promise<PaperResult[]>`
- [ ] Gunakan fetch native dengan timeout 5 detik
- [ ] Parse XML response (arXiv menggunakan Atom feed)
- [ ] Map ke `PaperResult`

### DOAJ
- [ ] Buat `lib/sources/doaj.ts`
- [ ] Implementasi fungsi `searchDOAJ(query: string): Promise<PaperResult[]>`
- [ ] Gunakan fetch native dengan timeout 5 detik
- [ ] Parse response dan map ke `PaperResult`

---

## 5. Search Processing

### Normalizer
- [ ] Buat `lib/normalizer.ts`
- [ ] Implementasi `normalizeResult(raw: unknown, source: SourceName): PaperResult`
- [ ] Handle field yang missing/null dengan graceful fallback

### Deduplicator
- [ ] Buat `lib/deduplicator.ts`
- [ ] Implementasi dedup by DOI exact match
- [ ] Implementasi dedup by normalized title similarity (threshold 0.85)
- [ ] Unit test deduplicator dengan kasus edge (DOI null, title mirip, dsb.)

### Ranker
- [ ] Buat `lib/ranker.ts`
- [ ] Implementasi ranking: exact match → keyword in abstract → citation count → recency
- [ ] Return `PaperResult[]` yang sudah diurutkan

### Aggregator
- [ ] Buat `lib/aggregator.ts`
- [ ] Panggil semua source secara paralel dengan `Promise.allSettled`
- [ ] Collect partial result jika ada yang gagal
- [ ] Jalankan normalizer → deduplicator → ranker
- [ ] Return hasil + info sumber yang berhasil/gagal

---

## 6. Cache System

- [ ] Buat `lib/cache.ts`
- [ ] Implementasi `getCachedResult(queryHash: string): Promise<PaperResult[] | null>`
- [ ] Implementasi `saveToCache(queryHash: string, queryRaw: string, results: PaperResult[]): Promise<void>`
- [ ] Implementasi `hashQuery(query: string): string` — normalisasi + SHA-256
- [ ] Implementasi cache expiry check (`expires_at > NOW()`)
- [ ] Implementasi cleanup cache expired (bisa dipanggil saat startup)

---

## 7. Search API Endpoint

- [ ] Buat `app/api/search/route.ts`
- [ ] Implementasi validasi input (q, page, limit, year, source) menggunakan `zod`
- [ ] Implementasi cache check → aggregator flow
- [ ] Format response JSON sesuai API_DESIGN.md
- [ ] Handle semua error case (400, 503)
- [ ] Test endpoint secara manual dengan curl / browser

---

## 8. Frontend

### Layout & Homepage
- [ ] Buat `app/layout.tsx` dengan Tailwind CSS global
- [ ] Buat `app/page.tsx` — homepage dengan search bar

### Components
- [ ] Buat `components/SearchBar.tsx` dengan debounce 400ms
- [ ] Buat `components/ResultCard.tsx` — tampilkan satu paper (title, abstract, authors, year, citation, PDF button, source label)
- [ ] Buat `components/FilterPanel.tsx` — year, source, oa_only
- [ ] Buat `components/LoadingState.tsx`
- [ ] Buat `components/ErrorState.tsx`
- [ ] Buat `components/Pagination.tsx`

### Search UI Integration
- [ ] Hubungkan SearchBar ke `/api/search`
- [ ] Render daftar `ResultCard` dari response
- [ ] Render `FilterPanel` dan kirim params ke API
- [ ] Render `Pagination` berdasarkan `total` dan `limit`
- [ ] Tampilkan `LoadingState` saat fetching
- [ ] Tampilkan `ErrorState` saat API error

---

## 9. Optimization

- [ ] Verifikasi debounce berfungsi (tidak spam API saat user mengetik)
- [ ] Verifikasi cache hit mengembalikan hasil tanpa API call
- [ ] Verifikasi pagination tidak memuat ulang semua data
- [ ] Test responsive layout di mobile

---

## 10. Deployment

- [ ] Pastikan semua environment variables terdaftar di Vercel
- [ ] Konfigurasi SQLite untuk production (pastikan writable path)
- [ ] Build production (`npm run build`) — pastikan tidak ada error TypeScript
- [ ] Deploy ke Vercel
- [ ] Smoke test endpoint di production

---

## Phase 2 Tasks (Tidak untuk MVP)

- [ ] Investigasi API GARUDA — apakah ada REST API publik?
- [ ] Investigasi API Neliti — apakah ada REST API publik?
- [ ] Implementasi semantic search (embedding-based)
- [ ] Implementasi rekomendasi paper terkait
- [ ] Implementasi export citation (BibTeX, APA)

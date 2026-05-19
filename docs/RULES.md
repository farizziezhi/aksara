# RULES.md
# Engineering Rules

## Main Goal

Bangun search engine open-access jurnal yang:
- Cepat
- Relevan
- Menyediakan akses PDF gratis yang legal
- Ringan dan mudah di-maintain

---

## Hard Constraints — DILARANG DIGUNAKAN

Teknologi berikut tidak boleh digunakan dalam kondisi apapun:

| Kategori       | Yang Dilarang                                                      |
|----------------|--------------------------------------------------------------------|
| Backend/DB     | Supabase, Firebase, Elasticsearch, Algolia, database berbayar      |
| API            | API berbayar tanpa free tier yang memadai                          |
| Architecture   | Microservices, Kubernetes, container orchestration                 |
| Auth           | Authentication system, user accounts, admin dashboard             |
| AI Features    | AI chatbot terintegrasi (Phase 3, bukan MVP)                       |

---

## Allowed Stack

| Layer     | Teknologi              |
|-----------|------------------------|
| Frontend  | Next.js, React, Tailwind CSS, TypeScript |
| Backend   | Next.js API Routes     |
| Database  | SQLite + Prisma ORM    |
| Search    | SQLite FTS5            |

Jangan tambahkan dependensi baru tanpa alasan yang jelas.

---

## Architecture Rules

### Gunakan
- Monolith — satu Next.js app
- Folder structure sederhana dan flat
- Modular utilities (fungsi kecil, single responsibility)

### Hindari
- Abstraksi yang tidak perlu (factory, repository pattern berlebihan, dsb.)
- Enterprise architecture patterns
- Wrapper di atas wrapper

---

## API Rules

Setiap API client harus:
- [ ] Normalize response ke `PaperResult`
- [ ] Handle error dengan graceful (tidak throw unhandled exception)
- [ ] Implement timeout — **maksimal 5 detik per request**
- [ ] Mendukung partial result (jika 1 API gagal, lanjut dengan yang lain)
- [ ] Menyimpan response ke cache setelah berhasil

---

## Search Rules

Prioritas kualitas pencarian:
1. Relevansi hasil
2. Ketersediaan open-access / PDF
3. Kecepatan response
4. Kelengkapan metadata

> UI polish adalah prioritas rendah di MVP.

---

## Cache Rules

- TTL: **24 jam** (dapat dikonfigurasi via env `CACHE_TTL_HOURS`)
- Key: hash dari query yang dinormalisasi (lowercase + trim)
- Jika cache error: **fail-open** — lanjut query API, jangan crash
- Cleanup cache expired: jalankan saat startup atau via scheduled task

---

## Performance Rules

Wajib diimplementasikan di MVP:
- [ ] Debounce search input: **400ms**
- [ ] Query caching (SQLite)
- [ ] Pagination: default 10, maksimal 25 per halaman
- [ ] Lazy loading untuk abstract panjang (truncate + "show more")

---

## Coding Rules

- **Selalu gunakan TypeScript** — tidak ada `any` type kecuali sangat terpaksa, dan harus diberi komentar alasannya
- **Fungsi kecil** — satu fungsi, satu tanggung jawab
- **Reusable components** — jangan duplikasi UI
- **Prioritaskan readability** — kode dibaca lebih sering dari ditulis
- **Explicit error handling** — tidak ada silent failure

```typescript
// ❌ Buruk
const data: any = await fetchSomething();

// ✅ Baik
const data: PaperResult[] = await fetchSomething();

// ✅ Jika terpaksa any, beri komentar
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw: any = parseXML(xmlString); // arXiv XML parser belum punya type definisi
```

---

## UI Rules

UI harus:
- Minimal dan bersih
- Readable (font size, contrast yang cukup)
- Responsive (mobile-friendly)

UI tidak boleh:
- Heavy animations
- Efek visual yang tidak perlu
- Transisi kompleks

---

## Development Priority

Urutkan pekerjaan sesuai prioritas ini:

1. Search engine logic (aggregator, normalizer, deduplicator, ranker)
2. External API integration (OpenAlex → CORE → Unpaywall → arXiv → DOAJ)
3. Cache system
4. Search API endpoint
5. Basic UI (search bar + result cards)
6. Pagination & filters
7. UI improvements & polish

---

## Definition of Done (per task)

Sebuah task dianggap selesai jika:
- [ ] Kode berjalan tanpa TypeScript error
- [ ] Error case sudah di-handle (bukan hanya happy path)
- [ ] Tidak ada `console.log` debug yang tertinggal di production code
- [ ] Komponen/fungsi baru sudah diuji secara manual

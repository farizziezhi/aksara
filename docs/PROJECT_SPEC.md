# PROJECT_SPEC.md
# Open Access Journal Search Engine

## Overview

Website pencarian jurnal open-access gratis yang mengagregasi banyak sumber jurnal
internasional dan Indonesia.

## Tujuan Utama

- Menemukan paper open-access secara legal
- Menyediakan link PDF gratis yang valid
- Pencarian cepat dan relevan
- Mendukung jurnal internasional dan Indonesia (Phase 2)

---

## Core Features

### Search
User dapat mencari berdasarkan:
- Keyword
- Title
- DOI
- Author

### Filters
- Open access only
- Publication year
- Source database
- PDF available
- Indonesia / International

### Search Result
Setiap hasil menampilkan:
- Title
- Abstract
- Authors
- Publication year
- Citation count
- DOI
- Source database
- PDF link (jika tersedia)

---

## External Data Sources

### Phase 1 — International (MVP)

| Source     | API Type    | Auth Required        | Notes                            |
|------------|-------------|----------------------|----------------------------------|
| OpenAlex   | REST        | Tidak (email polite) | Sumber utama, gratis, lengkap    |
| CORE       | REST        | API Key gratis       | Butuh daftar di core.ac.uk       |
| Unpaywall  | REST        | Email parameter      | Khusus PDF link open-access      |
| arXiv      | XML/REST    | Tidak                | Fokus STEM & CS                  |
| DOAJ       | REST        | Tidak                | Directory jurnal open-access     |

> **PENTING:** Daftarkan API Key CORE dan siapkan email untuk Unpaywall
> sebelum memulai development. Simpan di `.env.local`.

### Phase 2 — Indonesia

| Source  | Status         | Catatan                                         |
|---------|----------------|-------------------------------------------------|
| GARUDA  | Research needed | Tidak ada public REST API resmi, perlu investigasi |
| Neliti  | Research needed | Perlu verifikasi ketersediaan API               |

> **RISIKO:** GARUDA dan Neliti tidak memiliki public API yang terdokumentasi.
> Jangan asumsikan bisa diintegrasikan seperti OpenAlex. Investigasi dulu
> sebelum masuk ke roadmap Phase 2.

---

## Search Flow

```
1. User input query
        ↓
2. Validasi input (panjang, karakter, dsb.)
        ↓
3. Cek cache SQLite
   ├── HIT  → return cached result (tandai sebagai cached)
   └── MISS → lanjut ke langkah 4
        ↓
4. Query external APIs secara paralel
   (OpenAlex, CORE, Unpaywall, arXiv, DOAJ)
   → Timeout: 5 detik per API
   → Partial result diizinkan jika ≥1 API berhasil
        ↓
5. Normalize semua response ke format standar
        ↓
6. Deduplikasi hasil
   → Prioritas: DOI exact match
   → Fallback: normalized title similarity (threshold ≥ 0.85)
        ↓
7. Ranking
   → exact title match → semantic relevance → citation count → recency
        ↓
8. Simpan ke cache SQLite (TTL: 24 jam)
        ↓
9. Return hasil ke user
```

---

## Timeout & Partial Result Policy

- Timeout per API: **5 detik**
- Jika semua API gagal: return error dengan pesan jelas
- Jika sebagian API gagal: return partial result dengan label sumber yang berhasil
- Log semua API failure untuk monitoring

---

## Deduplication Logic

Urutan prioritas deduplication:

1. **DOI exact match** — jika DOI sama, anggap duplikat
2. **Normalized title similarity** — bandingkan title setelah lowercase + strip punctuation
   - Threshold: ≥ 0.85 (Jaccard similarity atau Levenshtein distance ternormalisasi)
   - Hanya aktif jika DOI tidak tersedia
3. **Author + year matching** — sebagai tiebreaker jika title mirip tapi belum pasti duplikat

---

## Ranking Logic

| Prioritas | Kriteria               | Bobot  |
|-----------|------------------------|--------|
| 1         | Exact title match      | Tinggi |
| 2         | Keyword in abstract    | Sedang |
| 3         | Citation count         | Sedang |
| 4         | Recency (tahun terbit) | Rendah |

> Semantic search (embedding-based) masuk Phase 2. MVP menggunakan keyword ranking saja.

---

## MVP Scope

Yang **masuk** MVP:
- Search by keyword
- Integrasi OpenAlex, CORE, Unpaywall, arXiv
- Normalisasi & deduplikasi
- Cache SQLite
- Basic UI (search bar, result cards)
- Pagination

Yang **tidak masuk** MVP:
- Semantic search
- Rekomendasi paper
- Integrasi GARUDA/Neliti
- AI summary
- Export citation
- User collection
- Autentikasi user

---

## Roadmap

### Phase 1 — MVP
Search engine fungsional dengan 4 sumber internasional.

### Phase 2 — Indonesia & Advanced Search
- Integrasi GARUDA/Neliti (setelah investigasi API)
- Semantic search
- Advanced filters

### Phase 3 — User Features
- AI summaries
- Export citation (BibTeX, APA, MLA)
- User collections
- Related papers

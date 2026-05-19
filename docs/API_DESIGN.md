# API_DESIGN.md
# API Design

## Endpoint

### GET /api/search

Endpoint utama untuk pencarian paper open-access.

---

## Query Parameters

| Parameter | Type    | Required | Default | Deskripsi                                  |
|-----------|---------|----------|---------|--------------------------------------------|
| `q`       | string  | ✅ Ya    | —       | Search query (keyword, title, DOI, author) |
| `page`    | integer | Tidak    | 1       | Halaman hasil (pagination)                 |
| `limit`   | integer | Tidak    | 10      | Jumlah hasil per halaman (max: 25)         |
| `year`    | integer | Tidak    | —       | Filter tahun publikasi                     |
| `source`  | string  | Tidak    | —       | Filter sumber (openalex, core, arxiv, dsb) |
| `oa_only` | boolean | Tidak    | true    | Hanya tampilkan yang open-access           |

---

## Contoh Request

```
GET /api/search?q=machine+learning+healthcare
GET /api/search?q=deep+learning&year=2023&page=2
GET /api/search?q=doi:10.1038/nature12345
GET /api/search?q=machine+learning&source=openalex&limit=25
```

---

## Response Format

### Success (HTTP 200)

```json
{
  "query": "machine learning healthcare",
  "total": 142,
  "page": 1,
  "limit": 10,
  "from_cache": false,
  "sources_queried": ["OpenAlex", "CORE", "arXiv"],
  "sources_failed": ["DOAJ"],
  "results": [
    {
      "id": "abc123",
      "title": "Machine Learning in Healthcare: A Review",
      "abstract": "This paper reviews...",
      "authors": ["Jane Doe", "John Smith"],
      "year": 2023,
      "doi": "10.1234/example.2023",
      "pdf_url": "https://example.com/paper.pdf",
      "source": "OpenAlex",
      "citation_count": 120,
      "is_open_access": true
    }
  ]
}
```

### Partial Result (HTTP 200, sebagian API gagal)

```json
{
  "query": "...",
  "total": 38,
  "page": 1,
  "limit": 10,
  "from_cache": false,
  "sources_queried": ["OpenAlex"],
  "sources_failed": ["CORE", "arXiv", "DOAJ", "Unpaywall"],
  "warning": "Beberapa sumber tidak dapat dijangkau. Hasil mungkin tidak lengkap.",
  "results": [ ... ]
}
```

### Error: Query terlalu pendek (HTTP 400)

```json
{
  "error": "BAD_REQUEST",
  "message": "Query minimal 3 karakter."
}
```

### Error: Semua API gagal (HTTP 503)

```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Semua sumber tidak dapat dijangkau saat ini. Coba lagi beberapa saat."
}
```

---

## Validasi Input

| Kondisi                      | Response                          |
|------------------------------|-----------------------------------|
| `q` tidak ada                | 400 — parameter `q` wajib diisi   |
| `q` kurang dari 3 karakter   | 400 — query terlalu pendek        |
| `q` lebih dari 200 karakter  | 400 — query terlalu panjang       |
| `page` bukan integer positif | 400 — nilai tidak valid           |
| `limit` lebih dari 25        | 400 — maksimal 25 per halaman     |
| `year` bukan 4 digit valid   | 400 — format tahun tidak valid    |

---

## Notes

- Semua response menggunakan `Content-Type: application/json`
- Field `from_cache: true` menandakan hasil berasal dari cache SQLite
- Field `sources_failed` selalu ada; kosong `[]` jika semua berhasil
- `pdf_url` bisa `null` jika paper tidak memiliki PDF open-access yang ditemukan
- `abstract` bisa `null` jika sumber tidak menyediakan abstrak

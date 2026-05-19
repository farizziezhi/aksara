# DATABASE.md
# Database Design

## Engine

- **Database:** SQLite
- **ORM:** Prisma
- **Full-text search:** SQLite FTS5
- **Lokasi file:** `./prisma/dev.db` (development), dapat dikonfigurasi via env

---

## Tujuan Database

Database digunakan **hanya** untuk:
- Cache hasil pencarian (mengurangi API calls)
- Menyimpan metadata paper yang sudah dinormalisasi
- Deduplication reference

Database **bukan** untuk:
- Menyimpan file PDF
- Mirroring seluruh jurnal dari sumber eksternal
- Data user / autentikasi

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Paper {
  id             String   @id                      // hash dari DOI atau title
  title          String
  abstract       String?
  year           Int?
  doi            String?  @unique
  pdf_url        String?
  source         String                             // "OpenAlex" | "CORE" | dsb.
  citation_count Int      @default(0)
  is_open_access Boolean  @default(true)
  fetched_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  authors        Author[]
  queries        CachedQueryResult[]
}

model Author {
  id       Int     @id @default(autoincrement())
  name     String
  paper_id String

  paper    Paper   @relation(fields: [paper_id], references: [id])

  @@index([paper_id])
}

model CachedQuery {
  id           Int      @id @default(autoincrement())
  query_hash   String   @unique                    // hash dari normalized query
  query_raw    String                              // query asli dari user
  result_count Int
  created_at   DateTime @default(now())
  expires_at   DateTime                            // created_at + 24 jam

  results      CachedQueryResult[]
}

model CachedQueryResult {
  id       Int    @id @default(autoincrement())
  query_id Int
  paper_id String
  rank     Int                                     // urutan di hasil pencarian

  query    CachedQuery @relation(fields: [query_id], references: [id])
  paper    Paper       @relation(fields: [paper_id], references: [id])

  @@index([query_id])
}
```

---

## Cache Logic

### Cache TTL

- **Default:** 24 jam sejak `created_at`
- Saat query masuk, cek `expires_at < NOW()`
- Jika expired: hapus cache lama, query ulang API, simpan cache baru

### Cache Key

- Ambil query string dari user
- Normalisasi: lowercase, trim whitespace, sort words (opsional)
- Hash dengan SHA-256 → simpan sebagai `query_hash`

Contoh:
```
"Machine Learning Healthcare" → "healthcare learning machine" → sha256 → "a3f8c..."
```

### Cache Miss Flow

```
1. Hitung query_hash
2. Cari CachedQuery WHERE query_hash = ? AND expires_at > NOW()
3. Jika tidak ada → query API → simpan Paper + CachedQuery + CachedQueryResult
4. Jika ada → ambil Paper via CachedQueryResult ORDER BY rank
```

---

## Indexes

```sql
-- Index untuk lookup cache
CREATE INDEX idx_cached_query_hash ON CachedQuery(query_hash);
CREATE INDEX idx_cached_query_expires ON CachedQuery(expires_at);

-- Index untuk deduplication
CREATE INDEX idx_paper_doi ON Paper(doi);

-- Full-text search (FTS5)
CREATE VIRTUAL TABLE paper_fts USING fts5(
  title,
  abstract,
  content='Paper',
  content_rowid='rowid'
);
```

---

## Maintenance

- **Cache cleanup:** hapus baris `CachedQuery` dengan `expires_at < NOW()` secara berkala
  - Bisa dijalankan via cron job sederhana atau triggered saat app startup
- **Ukuran database:** monitor secara berkala; tidak ada limit keras di MVP
- **Backup:** cukup copy file `.db` untuk backup sederhana

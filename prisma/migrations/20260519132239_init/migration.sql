-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "year" INTEGER,
    "doi" TEXT,
    "pdf_url" TEXT,
    "source" TEXT NOT NULL,
    "citation_count" INTEGER NOT NULL DEFAULT 0,
    "is_open_access" BOOLEAN NOT NULL DEFAULT true,
    "fetched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    CONSTRAINT "Author_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CachedQuery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query_hash" TEXT NOT NULL,
    "query_raw" TEXT NOT NULL,
    "result_count" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CachedQueryResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query_id" INTEGER NOT NULL,
    "paper_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    CONSTRAINT "CachedQueryResult_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "CachedQuery" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CachedQueryResult_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Paper_doi_key" ON "Paper"("doi");

-- CreateIndex
CREATE INDEX "Paper_doi_idx" ON "Paper"("doi");

-- CreateIndex
CREATE INDEX "Author_paper_id_idx" ON "Author"("paper_id");

-- CreateIndex
CREATE UNIQUE INDEX "CachedQuery_query_hash_key" ON "CachedQuery"("query_hash");

-- CreateIndex
CREATE INDEX "CachedQuery_query_hash_idx" ON "CachedQuery"("query_hash");

-- CreateIndex
CREATE INDEX "CachedQuery_expires_at_idx" ON "CachedQuery"("expires_at");

-- CreateIndex
CREATE INDEX "CachedQueryResult_query_id_idx" ON "CachedQueryResult"("query_id");

-- CreateIndex
CREATE INDEX "CachedQueryResult_paper_id_idx" ON "CachedQueryResult"("paper_id");

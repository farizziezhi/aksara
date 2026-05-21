# Deploy: Vercel + Turso (Free)

## Prereqs
- GitHub repo pushed to remote.
- Vercel account (Hobby tier).
- Turso account (free).

## 1. Create Turso DB

```bash
# install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

turso auth signup       # or: turso auth login
turso db create oaj-search
turso db show oaj-search --url
turso db tokens create oaj-search
```

Save:
- `DATABASE_URL=libsql://<...>.turso.io`
- `DATABASE_AUTH_TOKEN=<token>`

## 2. Run Migrations Against Turso

Prisma CLI's SQLite provider rejects `libsql://` URLs, so run the migration SQL through the libSQL client script:

```bash
DATABASE_URL="libsql://<...>.turso.io" \
DATABASE_AUTH_TOKEN="<token>" \
pnpm dlx tsx scripts/turso-migrate.ts
```

Verify:

```bash
DATABASE_URL="libsql://<...>.turso.io" \
DATABASE_AUTH_TOKEN="<token>" \
pnpm dlx tsx scripts/turso-verify.ts
```

Expected tables: `Paper`, `Author`, `CachedQuery`, `CachedQueryResult`, `paper_fts`, `_migrations`.

## 3. Push Code

```bash
git push origin main
```

## 4. Import Project in Vercel

- vercel.com → Add New → Project → import repo.
- Framework auto-detects Next.js.
- Build/install commands come from `vercel.json` (override unnecessary).

## 5. Vercel Environment Variables

Settings → Environment Variables:

| Name | Value | Env |
|------|-------|-----|
| `DATABASE_URL` | `libsql://<...>.turso.io` | Production, Preview |
| `DATABASE_AUTH_TOKEN` | `<token>` | Production, Preview |
| `CORE_API_KEY` | `<key>` | Production, Preview |
| `UNPAYWALL_EMAIL` | `<email>` | Production, Preview |
| `CACHE_TTL_HOURS` | `24` | Production, Preview |
| `RATE_LIMIT_SEARCH_PER_MIN` | `30` | Production, Preview |
| `MAX_API_TIMEOUT_MS` | `5000` | Production, Preview |

## 6. Deploy

Push to `main` triggers deploy. First build runs `pnpm prisma generate && pnpm next build`.

## 7. Smoke

```bash
curl -s -o /dev/null -w "homepage %{http_code}\n" https://<project>.vercel.app/
curl -s "https://<project>.vercel.app/api/search?q=neural+network&limit=3" | head -c 400
```

Expect: 200, JSON with `results`.

## Notes

- Vercel serverless: rate limiter is in-memory per-instance. Multi-instance cold starts mean limit resets per region/instance. For stronger limits use Upstash Redis later.
- Turso free: 9 GB storage, 1B row reads/mo, 25M writes/mo. Cache pruning keeps it small.
- libSQL adapter already wired in `lib/db.ts`. No code change needed beyond env vars.
- `paper_fts` virtual table works on Turso (libSQL = SQLite + extensions).

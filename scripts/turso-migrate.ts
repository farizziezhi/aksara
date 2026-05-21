import path from "node:path";
import fs from "node:fs/promises";
import { createClient } from "@libsql/client";

interface AppliedRow {
  migration_name: string;
}

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = createClient(authToken ? { url, authToken } : { url });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      migration_name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  const applied = await client.execute("SELECT migration_name FROM _migrations");
  const appliedSet = new Set(
    (applied.rows as unknown as AppliedRow[]).map((r) => r.migration_name),
  );

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const dirs = (await fs.readdir(migrationsDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const dir of dirs) {
    if (appliedSet.has(dir)) {
      console.log(`skip ${dir} (applied)`);
      continue;
    }
    const file = path.join(migrationsDir, dir, "migration.sql");
    const sql = await fs.readFile(file, "utf8");
    const stmts = splitSql(sql);
    console.log(`apply ${dir} (${stmts.length} statements)`);
    for (const s of stmts) {
      await client.execute(s);
    }
    await client.execute({
      sql: "INSERT INTO _migrations (migration_name, applied_at) VALUES (?, ?)",
      args: [dir, Date.now()],
    });
  }

  console.log("done");
  client.close();
}

function splitSql(sql: string): string[] {
  const cleaned = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");

  const out: string[] = [];
  let buf = "";
  let inTrigger = false;

  for (const line of cleaned.split("\n")) {
    const upper = line.trim().toUpperCase();
    if (!inTrigger && /^CREATE\s+TRIGGER\b/.test(upper)) {
      inTrigger = true;
    }
    buf += line + "\n";
    if (inTrigger) {
      if (/^END\s*;?\s*$/.test(line.trim().toUpperCase())) {
        inTrigger = false;
        const t = buf.trim().replace(/;$/, "");
        if (t) out.push(t);
        buf = "";
      }
      continue;
    }
    if (line.trim().endsWith(";")) {
      const t = buf.trim().replace(/;$/, "");
      if (t) out.push(t);
      buf = "";
    }
  }
  const tail = buf.trim().replace(/;$/, "");
  if (tail) out.push(tail);
  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

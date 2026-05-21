import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = createClient(authToken ? { url, authToken } : { url });

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type IN ('table','trigger','index') ORDER BY type, name",
  );
  for (const r of tables.rows) console.log(r);
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

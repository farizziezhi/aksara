import { prisma } from "../lib/db";

type Row = { name: string; type: string };

async function main() {
  const objects = await prisma.$queryRawUnsafe<Row[]>(
    "SELECT name, type FROM sqlite_master WHERE name LIKE 'paper%' OR name LIKE 'Cached%' OR name = 'Author' OR name = 'Paper' ORDER BY type, name"
  );
  console.log("DB objects:");
  for (const o of objects) console.log(`  ${o.type.padEnd(8)} ${o.name}`);

  const paper = await prisma.paper.create({
    data: {
      id: "test-paper-1",
      title: "Machine Learning in Healthcare",
      abstract: "A study on ML applications in medical diagnosis.",
      source: "OpenAlex",
    },
  });
  console.log("Inserted:", paper.id);

  const hits = await prisma.$queryRawUnsafe<{ paper_id: string }[]>(
    "SELECT paper_id FROM paper_fts WHERE paper_fts MATCH ?",
    "healthcare"
  );
  console.log("FTS match for 'healthcare':", hits);

  await prisma.paper.delete({ where: { id: "test-paper-1" } });
  const after = await prisma.$queryRawUnsafe<{ paper_id: string }[]>(
    "SELECT paper_id FROM paper_fts WHERE paper_fts MATCH ?",
    "healthcare"
  );
  console.log("FTS after delete:", after);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});

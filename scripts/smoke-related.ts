import { prisma } from "../lib/db";
import { findRelatedPapers } from "../lib/related";

async function main() {
  const paper = await prisma.paper.findFirst({ select: { id: true, title: true } });
  if (!paper) {
    console.log("No cached papers. Run /api/search first.");
    return;
  }

  console.log(`Paper: ${paper.id} — ${paper.title}`);
  const related = await findRelatedPapers(paper.id, 5);
  console.log(`Related: ${related?.length ?? "null"}`);
  for (const r of related ?? []) console.log(`- [${r.source}] ${r.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });

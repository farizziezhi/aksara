import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";

declare global {
  var __prisma__: PrismaClient | undefined;
}

function createClient() {
  const url =
    process.env.DATABASE_URL ??
    `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = global.__prisma__ ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma;
}

import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";

declare global {
  var __prisma__: PrismaClient | undefined;
}

function createClient() {
  const rawUrl =
    process.env.DATABASE_URL ??
    `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  const url = rawUrl.trim();
  const rawToken = process.env.DATABASE_AUTH_TOKEN;
  const authToken = rawToken ? rawToken.trim() : undefined;
  const adapter = new PrismaLibSql(authToken ? { url, authToken } : { url });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = global.__prisma__ ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma;
}

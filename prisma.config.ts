import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

function buildUrl(): string {
  const raw = process.env["DATABASE_URL"];
  if (!raw) return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  const token = process.env["DATABASE_AUTH_TOKEN"];
  if (!token) return raw;
  return raw.includes("?") ? `${raw}&authToken=${token}` : `${raw}?authToken=${token}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: buildUrl(),
  },
});

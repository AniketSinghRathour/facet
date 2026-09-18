import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// This file is read by the Prisma CLI (`prisma generate`, `prisma db push`,
// etc.) only
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
});

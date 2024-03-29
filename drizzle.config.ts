import { type Config } from "drizzle-kit"

import { env } from "~/env.mjs"

export default {
  schema: "./src/server/db/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL
  },
  out: "migrations",
  tablesFilter: ["apply-ai_*"]
} satisfies Config

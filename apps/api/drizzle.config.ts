import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://tradeez:tradeez@localhost:5432/tradeez',
  },
  // 迁移文件入库，不用 push 直改生产库
  strict: true,
  verbose: true,
})

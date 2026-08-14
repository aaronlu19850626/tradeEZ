import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

/**
 * 迁移执行器。用 drizzle-orm 自带的 migrator 读取 drizzle/ 下的 SQL，
 * 不依赖 drizzle-kit —— 后者是 devDependency，不应进生产镜像。
 *
 * 用法：node dist/db/migrate.js
 */
async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('缺少 DATABASE_URL')

  // 迁移用单连接，且 max:1 避免并发执行同一批迁移
  const client = postgres(url, { max: 1 })
  try {
    const started = Date.now()
    await migrate(drizzle(client), { migrationsFolder: './drizzle' })
    console.info(`迁移完成，耗时 ${Date.now() - started}ms`)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error('迁移失败：', e instanceof Error ? e.message : e)
  process.exit(1)
})

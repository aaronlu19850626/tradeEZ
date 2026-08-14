import { Controller, Get, Inject } from '@nestjs/common'
import { emailSchema } from '@tradeez/shared'
import { sql } from 'drizzle-orm'
import { DB, type Database } from '../db/db.module.js'

/** 健康检查。部署时用于探活与验证数据库连通 */
@Controller('health')
export class HealthController {
  constructor(@Inject(DB) private readonly db: Database) {}

  @Get()
  async check() {
    // 顺带验证 @tradeez/shared 在运行时可加载：
    // 该包的 exports 指向编译产物，若镜像未拷入 dist，此处会直接抛错
    const sharedOk = emailSchema.safeParse('probe@tradeez.cn').success

    const started = Date.now()
    let dbOk = false
    let dbError: string | undefined
    try {
      await this.db.execute(sql`select 1`)
      dbOk = true
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e)
    }

    return {
      status: dbOk ? 'ok' : 'degraded',
      uptimeSec: Math.round(process.uptime()),
      db: { ok: dbOk, latencyMs: Date.now() - started, error: dbError },
      shared: sharedOk,
      timestamp: new Date().toISOString(),
    }
  }
}

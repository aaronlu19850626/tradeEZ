import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.js'

export const DB = Symbol('DB')
export const PG_CLIENT = Symbol('PG_CLIENT')

export type Database = PostgresJsDatabase<typeof schema>

/**
 * 数据库模块。全局提供 Drizzle 实例。
 * 标记 Global 是因为几乎每个业务模块都要用，逐个 import 徒增噪音。
 */
@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        postgres(config.getOrThrow<string>('DATABASE_URL'), {
          max: 10,
          // 保留 numeric 的字符串形态，避免转成 JS number 丢精度
          types: {},
        }),
    },
    {
      provide: DB,
      inject: [PG_CLIENT],
      useFactory: (client: ReturnType<typeof postgres>) => drizzle(client, { schema }),
    },
  ],
  exports: [DB, PG_CLIENT],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(PG_CLIENT) private readonly client: ReturnType<typeof postgres>) {}

  /** 进程退出前关闭连接池，避免容器停止时留下半开连接 */
  async onApplicationShutdown() {
    await this.client.end({ timeout: 5 })
  }
}

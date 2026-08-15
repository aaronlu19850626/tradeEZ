import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module.js'
import { DbModule } from './db/db.module.js'
import { HealthController } from './health/health.controller.js'
import { loadEnv } from './config/env.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 启动时校验环境变量，配置有误直接退出而非带病运行
      validate: loadEnv,
      envFilePath: ['.env.local', '.env'],
    }),
    DbModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

import 'reflect-metadata'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
  )

  // 前端请求路径统一带 /api 前缀，与 Vite proxy 及 Caddy 反代规则一致
  app.setGlobalPrefix('api')

  // 同域部署时无需 CORS；配了 CORS_ORIGIN 则按白名单放行
  const origin = process.env.CORS_ORIGIN
  if (origin) {
    app.enableCors({ origin: origin.split(','), credentials: true })
  }

  // 收到 SIGTERM 时执行 onApplicationShutdown，关闭数据库连接池
  app.enableShutdownHooks()

  const port = Number(process.env.PORT ?? 3000)
  await app.listen({ port, host: '0.0.0.0' })
  new Logger('Bootstrap').log(`API 已启动：http://localhost:${port}/api`)
}

void bootstrap()

import { z } from 'zod'

/**
 * 环境变量校验。启动时校验一次，缺失或格式错误直接崩溃退出，
 * 避免带着错误配置跑起来，到运行时才暴露问题。
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, '缺少 DATABASE_URL'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  /** access token 签名密钥，生产环境必须为足够长的随机串 */
  JWT_SECRET: z.string().min(32, 'JWT_SECRET 至少 32 位'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  /** 允许的前端来源，同域部署时留空 */
  CORS_ORIGIN: z.string().optional(),

  /** 微信开放平台凭据，未申请时留空则关闭扫码登录 */
  WECHAT_APP_ID: z.string().optional(),
  WECHAT_APP_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(source: Record<string, unknown> = process.env): Env {
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`)
    throw new Error(`环境变量配置有误：\n${lines.join('\n')}`)
  }
  return parsed.data
}

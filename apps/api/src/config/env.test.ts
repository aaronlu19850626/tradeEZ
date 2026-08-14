import { describe, expect, it } from 'vitest'
import { loadEnv } from './env.js'

const base = {
  DATABASE_URL: 'postgres://u:p@localhost:5432/db',
  JWT_SECRET: 'x'.repeat(32),
}

describe('环境变量校验', () => {
  it('补齐默认值', () => {
    const env = loadEnv(base)
    expect(env.NODE_ENV).toBe('development')
    expect(env.PORT).toBe(3000)
    expect(env.JWT_ACCESS_TTL).toBe('15m')
    expect(env.JWT_REFRESH_TTL_DAYS).toBe(30)
    expect(env.REDIS_URL).toBe('redis://localhost:6379')
  })

  it('PORT 字符串会被转成数字', () => {
    expect(loadEnv({ ...base, PORT: '8080' }).PORT).toBe(8080)
  })

  it('缺 DATABASE_URL 时抛错并指出字段', () => {
    expect(() => loadEnv({ JWT_SECRET: 'x'.repeat(32) })).toThrow(/DATABASE_URL/)
  })

  it('JWT_SECRET 短于 32 位时抛错', () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: 'too-short' })).toThrow(/JWT_SECRET/)
  })

  it('NODE_ENV 只接受三个枚举值', () => {
    expect(() => loadEnv({ ...base, NODE_ENV: 'staging' })).toThrow()
    expect(loadEnv({ ...base, NODE_ENV: 'production' }).NODE_ENV).toBe('production')
  })

  it('微信凭据可缺省，缺省即视为关闭扫码登录', () => {
    const env = loadEnv(base)
    expect(env.WECHAT_APP_ID).toBeUndefined()
    expect(env.WECHAT_APP_SECRET).toBeUndefined()
  })
})

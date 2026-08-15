import { describe, expect, it } from 'vitest'
import { hash, verify } from '@node-rs/argon2'
import { loginSchema, registerSchema, resetPasswordSchema } from '@tradeez/shared'

/**
 * 认证模块的纯逻辑测试。
 *
 * 数据库相关的分支（查重、事务、token 轮换）需要真实 Postgres，
 * 放到部署后由线上冒烟脚本覆盖；这里只测不依赖 IO 的部分。
 */

describe('密码哈希', () => {
  it('argon2 哈希可被校验，且同一密码两次哈希不同（含盐）', async () => {
    const a = await hash('abcd1234')
    const b = await hash('abcd1234')

    expect(a).not.toBe(b)
    expect(await verify(a, 'abcd1234')).toBe(true)
    expect(await verify(b, 'abcd1234')).toBe(true)
  })

  it('错误密码校验失败', async () => {
    const h = await hash('abcd1234')
    expect(await verify(h, 'wrong-pass')).toBe(false)
  })
})

describe('后端复用前端的 zod schema', () => {
  it('登录只校验非空，不校验强度 —— 存量账号密码可能不满足新规则', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123' }).success).toBe(true)
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })

  it('登录拒绝非法邮箱', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false)
  })

  /**
   * 注册接口不收 confirmPassword / agreed，但补齐后复用同一 schema，
   * 密码强度规则因此只有一处定义。
   */
  it('注册补齐表单字段后仍走同一份强度规则', () => {
    const build = (password: string) =>
      registerSchema.safeParse({
        nickname: 'Lu',
        email: 'a@b.com',
        password,
        confirmPassword: password,
        agreed: true,
      })

    expect(build('abcd1234').success).toBe(true)
    expect(build('abcdefgh').success).toBe(false) // 无数字
    expect(build('12345678').success).toBe(false) // 无字母
    expect(build('abc123').success).toBe(false) // 太短
  })

  it('重置密码沿用同一强度规则', () => {
    const ok = resetPasswordSchema.safeParse({
      password: 'newpass1',
      confirmPassword: 'newpass1',
    })
    expect(ok.success).toBe(true)

    const weak = resetPasswordSchema.safeParse({ password: 'short', confirmPassword: 'short' })
    expect(weak.success).toBe(false)
  })
})

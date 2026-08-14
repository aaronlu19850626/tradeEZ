import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { AuthSession, WechatQrState, WechatQrTicket } from '@/types/auth'
import { SEED_ACCOUNT } from '../data/users'
import { authHandlers } from './auth'

/** 认证接口 mock 的行为测试。F-19 */

const server = setupServer(...authHandlers)
const BASE = 'http://localhost:5173/api'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  // 重置链接会打到控制台，测试里静音
  vi.spyOn(console, 'info').mockImplementation(() => {})
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function post(path: string, body?: unknown, token?: string) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('登录（F-19-02）', () => {
  it('凭正确的种子账号返回会话', async () => {
    const res = await post('/auth/login', SEED_ACCOUNT)
    expect(res.status).toBe(200)
    const session = (await res.json()) as AuthSession
    expect(session.token).toMatch(/^mock-token-/)
    expect(session.user.email).toBe(SEED_ACCOUNT.email)
    expect(session.expiresAt).toBeGreaterThan(Date.now())
    // 公开用户对象不得含密码
    expect(session.user).not.toHaveProperty('password')
  })

  it('密码错误返回 401，且提示不区分账号是否存在', async () => {
    const wrongPass = await post('/auth/login', { ...SEED_ACCOUNT, password: 'wrong-pass-1' })
    const noUser = await post('/auth/login', { email: 'nobody@x.com', password: 'whatever1' })
    expect(wrongPass.status).toBe(401)
    expect(noUser.status).toBe(401)
    const a = (await wrongPass.json()) as { message: string }
    const b = (await noUser.json()) as { message: string }
    expect(a.message).toBe(b.message)
  })

  it('邮箱格式非法返回 400', async () => {
    const res = await post('/auth/login', { email: 'kkk', password: 'abcd1234' })
    expect(res.status).toBe(400)
    expect(((await res.json()) as { message: string }).message).toBe('电子邮件地址无效')
  })
})

describe('注册（F-19-03）', () => {
  it('新邮箱注册成功并直接返回会话', async () => {
    const email = `new-${Date.now()}@tradeez.com`
    const res = await post('/auth/register', { nickname: '新用户', email, password: 'abcd1234' })
    expect(res.status).toBe(201)
    const session = (await res.json()) as AuthSession
    expect(session.user.email).toBe(email)
    expect(session.user.providers).toEqual(['password'])
    expect(session.token).toBeTruthy()
  })

  it('重复邮箱返回 409', async () => {
    const res = await post('/auth/register', {
      nickname: 'Dup',
      email: SEED_ACCOUNT.email,
      password: 'abcd1234',
    })
    expect(res.status).toBe(409)
  })

  it('弱密码返回 400', async () => {
    const res = await post('/auth/register', {
      nickname: 'Weak',
      email: `weak-${Date.now()}@x.com`,
      password: 'abcdefgh',
    })
    expect(res.status).toBe(400)
  })
})

describe('找回密码（F-19-04）', () => {
  it('不存在的邮箱也返回成功，避免账号枚举', async () => {
    const res = await post('/auth/forgot-password', { email: 'ghost@nowhere.com' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ sent: true })
  })

  it('完整重置流程：发链接 → 校验 token → 改密码 → 旧密码失效', async () => {
    const email = `reset-${Date.now()}@tradeez.com`
    await post('/auth/register', { nickname: 'R', email, password: 'oldpass1' })

    // 从控制台输出里取 token
    const infoSpy = vi.spyOn(console, 'info')
    await post('/auth/forgot-password', { email })
    const logged = infoSpy.mock.calls.at(-1)?.[0] as string
    const token = logged.match(/token=([\w-]+)/)?.[1]
    expect(token).toBeTruthy()

    const verify = await fetch(`${BASE}/auth/reset-token?token=${token}`)
    expect(((await verify.json()) as { valid: boolean }).valid).toBe(true)

    const reset = await post('/auth/reset-password', { token, password: 'newpass1' })
    expect(reset.status).toBe(200)

    // 新密码可登录，旧密码失效
    expect((await post('/auth/login', { email, password: 'newpass1' })).status).toBe(200)
    expect((await post('/auth/login', { email, password: 'oldpass1' })).status).toBe(401)

    // token 一次性
    expect((await post('/auth/reset-password', { token, password: 'again123' })).status).toBe(400)
  })

  it('无效 token 校验返回 valid: false', async () => {
    const res = await fetch(`${BASE}/auth/reset-token?token=bogus`)
    expect(((await res.json()) as { valid: boolean }).valid).toBe(false)
  })
})

describe('微信扫码（F-19-05）', () => {
  it('状态按时间推进 pending → scanned → confirmed，authCode 可换会话', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const ticketRes = await post('/auth/wechat/qrcode')
      const { ticket } = (await ticketRes.json()) as WechatQrTicket

      const read = async () => {
        const r = await fetch(`${BASE}/auth/wechat/status?ticket=${ticket}`)
        return (await r.json()) as WechatQrState
      }

      expect((await read()).status).toBe('pending')

      vi.advanceTimersByTime(3500)
      expect((await read()).status).toBe('scanned')

      vi.advanceTimersByTime(3000)
      const confirmed = await read()
      expect(confirmed.status).toBe('confirmed')
      expect(confirmed.authCode).toBeTruthy()

      const exchange = await post('/auth/wechat/exchange', { authCode: confirmed.authCode })
      expect(exchange.status).toBe(200)
      const session = (await exchange.json()) as AuthSession
      expect(session.user.providers).toContain('wechat')

      // authCode 一次性
      expect((await post('/auth/wechat/exchange', { authCode: confirmed.authCode })).status).toBe(400)
    } finally {
      vi.useRealTimers()
    }
  })

  it('二维码超时返回 expired', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const { ticket } = (await (await post('/auth/wechat/qrcode')).json()) as WechatQrTicket
      vi.advanceTimersByTime(3 * 60 * 1000)
      const r = await fetch(`${BASE}/auth/wechat/status?ticket=${ticket}`)
      expect(((await r.json()) as WechatQrState).status).toBe('expired')
    } finally {
      vi.useRealTimers()
    }
  })

  it('未知 ticket 视为 expired', async () => {
    const r = await fetch(`${BASE}/auth/wechat/status?ticket=nope`)
    expect(((await r.json()) as WechatQrState).status).toBe('expired')
  })
})

describe('会话（F-19-06）', () => {
  it('带 token 可取当前用户，登出后失效', async () => {
    const session = (await (await post('/auth/login', SEED_ACCOUNT)).json()) as AuthSession

    const me = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    expect(me.status).toBe(200)

    expect((await post('/auth/logout', undefined, session.token)).status).toBe(204)

    const after = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    expect(after.status).toBe(401)
  })

  it('无 token 取当前用户返回 401', async () => {
    expect((await fetch(`${BASE}/auth/me`)).status).toBe(401)
  })
})

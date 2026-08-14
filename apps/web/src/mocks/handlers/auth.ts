import { HttpResponse, http } from 'msw'
import { lag } from '../latency'
import type { AuthSession, WechatQrState, WechatQrTicket } from '@tradeez/shared'
import { loginSchema, registerSchema, resetPasswordSchema } from '@tradeez/shared'
import {
  RESET_TTL_MS,
  SESSION_TTL_MS,
  createUser,
  findByEmail,
  findByWechatOpenId,
  resetTokens,
  sessions,
  toPublicUser,
  users,
} from '../data/users'

/** 认证接口 mock。F-19 */

const API = '/api'

function fail(status: number, message: string) {
  return HttpResponse.json({ message }, { status })
}

function issueSession(email: string): AuthSession {
  const token = `mock-token-${crypto.randomUUID()}`
  sessions.set(token, email.toLowerCase())
  return {
    token,
    expiresAt: Date.now() + SESSION_TTL_MS,
    user: toPublicUser(findByEmail(email)!),
  }
}

function currentUser(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return undefined
  const email = sessions.get(token)
  return email ? findByEmail(email) : undefined
}

/** 扫码状态机。ticket → 状态 + 创建时间，按经过时长自动推进 */
interface QrRecord {
  createdAt: number
  expiresAt: number
  status: WechatQrState['status']
  canceled: boolean
}
const qrTickets = new Map<string, QrRecord>()

const QR_TTL_MS = 2 * 60 * 1000
/** mock 行为：3 秒后视为已扫码，6 秒后视为已确认，模拟用户掏手机的耗时 */
const SCAN_AT_MS = 3000
const CONFIRM_AT_MS = 6000

const wechatAuthCodes = new Map<string, string>()

export const authHandlers = [
  // F-19-02 邮箱密码登录
  http.post(`${API}/auth/login`, async ({ request }) => {
    await lag(450)
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return fail(400, parsed.error.issues[0].message)

    const user = findByEmail(parsed.data.email)
    // 不区分「账号不存在」与「密码错误」，避免账号枚举
    if (!user || user.password !== parsed.data.password) {
      return fail(401, '电子邮件地址或密码不正确')
    }
    return HttpResponse.json(issueSession(user.email))
  }),

  // F-19-03 注册
  http.post(`${API}/auth/register`, async ({ request }) => {
    await lag(500)
    const body = (await request.json()) as Record<string, unknown>
    // 注册接口不收 confirmPassword/agreed，补齐后复用同一份 schema 校验
    const parsed = registerSchema.safeParse({
      ...body,
      confirmPassword: body.password,
      agreed: true,
    })
    if (!parsed.success) return fail(400, parsed.error.issues[0].message)

    if (findByEmail(parsed.data.email)) {
      return fail(409, '该电子邮件地址已注册')
    }
    const user = createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      nickname: parsed.data.nickname,
    })
    return HttpResponse.json(issueSession(user.email), { status: 201 })
  }),

  // F-19-04 发送重置链接
  http.post(`${API}/auth/forgot-password`, async ({ request }) => {
    await lag(600)
    const { email } = (await request.json()) as { email: string }
    const user = findByEmail(email)
    // 无论账号是否存在都返回成功，避免账号枚举
    if (user) {
      const token = `reset-${crypto.randomUUID()}`
      resetTokens.set(token, { email: user.email, expiresAt: Date.now() + RESET_TTL_MS })
      // mock 阶段把链接打到控制台，替代真实邮件（Node 测试环境无 location）
      const origin = typeof location === 'undefined' ? '' : location.origin
      console.info(`[TradeEZ mock] 密码重置链接：${origin}/reset-password?token=${token}`)
    }
    return HttpResponse.json({ sent: true })
  }),

  http.get(`${API}/auth/reset-token`, async ({ request }) => {
    await lag(250)
    const token = new URL(request.url).searchParams.get('token') ?? ''
    const rec = resetTokens.get(token)
    if (!rec || rec.expiresAt < Date.now()) {
      resetTokens.delete(token)
      return HttpResponse.json({ valid: false })
    }
    return HttpResponse.json({ valid: true, email: rec.email })
  }),

  http.post(`${API}/auth/reset-password`, async ({ request }) => {
    await lag(500)
    const { token, password } = (await request.json()) as { token: string; password: string }
    const rec = resetTokens.get(token)
    if (!rec || rec.expiresAt < Date.now()) {
      resetTokens.delete(token)
      return fail(400, '重置链接已失效，请重新申请')
    }
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword: password })
    if (!parsed.success) return fail(400, parsed.error.issues[0].message)

    const user = findByEmail(rec.email)!
    user.password = password
    if (!user.providers.includes('password')) user.providers.push('password')
    resetTokens.delete(token)
    // 重置密码后使该用户所有会话失效
    for (const [t, email] of sessions) if (email === rec.email.toLowerCase()) sessions.delete(t)
    return HttpResponse.json({ ok: true })
  }),

  // F-19-05 微信扫码
  http.post(`${API}/auth/wechat/qrcode`, async () => {
    await lag(400)
    const ticket = crypto.randomUUID()
    const now = Date.now()
    qrTickets.set(ticket, {
      createdAt: now,
      expiresAt: now + QR_TTL_MS,
      status: 'pending',
      canceled: false,
    })
    const body: WechatQrTicket = {
      ticket,
      qrPayload: `https://open.weixin.qq.com/connect/mock?ticket=${ticket}`,
      expiresAt: now + QR_TTL_MS,
    }
    return HttpResponse.json(body)
  }),

  http.get(`${API}/auth/wechat/status`, async ({ request }) => {
    await lag(120)
    const ticket = new URL(request.url).searchParams.get('ticket') ?? ''
    const rec = qrTickets.get(ticket)
    if (!rec) return HttpResponse.json<WechatQrState>({ status: 'expired' })
    if (rec.canceled) return HttpResponse.json<WechatQrState>({ status: 'canceled' })
    if (Date.now() > rec.expiresAt) {
      return HttpResponse.json<WechatQrState>({ status: 'expired' })
    }

    // 按经过时长推进状态，模拟真实扫码流程
    const elapsed = Date.now() - rec.createdAt
    if (elapsed >= CONFIRM_AT_MS) {
      const authCode = `wxcode-${ticket.slice(0, 8)}`
      wechatAuthCodes.set(authCode, 'ox_mock_openid_001')
      return HttpResponse.json<WechatQrState>({
        status: 'confirmed',
        authCode,
        nickname: '微信用户_Lu',
      })
    }
    if (elapsed >= SCAN_AT_MS) {
      return HttpResponse.json<WechatQrState>({ status: 'scanned', nickname: '微信用户_Lu' })
    }
    return HttpResponse.json<WechatQrState>({ status: 'pending' })
  }),

  /** 手机端取消（调试用，弹窗内不暴露入口） */
  http.post(`${API}/auth/wechat/cancel`, async ({ request }) => {
    const { ticket } = (await request.json()) as { ticket: string }
    const rec = qrTickets.get(ticket)
    if (rec) rec.canceled = true
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${API}/auth/wechat/exchange`, async ({ request }) => {
    await lag(350)
    const { authCode } = (await request.json()) as { authCode: string }
    const openId = wechatAuthCodes.get(authCode)
    if (!openId) return fail(400, '授权码已失效，请重新扫码')
    wechatAuthCodes.delete(authCode)

    const user = findByWechatOpenId(openId)
    if (!user) return fail(404, '未找到关联账号')
    return HttpResponse.json(issueSession(user.email))
  }),

  // 会话
  http.get(`${API}/auth/me`, async ({ request }) => {
    await lag(200)
    const user = currentUser(request)
    if (!user) return fail(401, '未登录或会话已过期')
    return HttpResponse.json(toPublicUser(user))
  }),

  http.post(`${API}/auth/logout`, async ({ request }) => {
    await lag(200)
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (token) sessions.delete(token)
    return new HttpResponse(null, { status: 204 })
  }),

  /** 调试用：查看 mock 用户库规模 */
  http.get(`${API}/auth/_debug/users`, () =>
    HttpResponse.json({ count: users.size, emails: [...users.keys()] }),
  ),
]

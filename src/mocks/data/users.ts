import type { AuthUser } from '@/types/auth'

/**
 * mock 用户库。存在内存中，刷新页面即重置（种子账号除外）。
 * 密码以明文存储 —— 仅 mock 用途，真实后端必须用 bcrypt/argon2 加盐哈希。
 */

interface StoredUser extends AuthUser {
  password: string
  /** 微信 openid，扫码登录时匹配 */
  wechatOpenId?: string
}

export const SEED_ACCOUNT = { email: 'demo@tradeez.com', password: 'tradeez2026' }

export const users = new Map<string, StoredUser>()

function addUser(u: StoredUser) {
  users.set(u.email.toLowerCase(), u)
  return u
}

// 种子账号，方便直接登录查看
addUser({
  id: 'u-1',
  email: SEED_ACCOUNT.email,
  password: SEED_ACCOUNT.password,
  nickname: 'Lu',
  avatarUrl: null,
  providers: ['password'],
  emailVerified: true,
  createdAt: '2026-01-05T00:00:00.000Z',
})

// 微信扫码登录命中的账号
addUser({
  id: 'u-2',
  email: 'wechat-user@tradeez.com',
  password: '',
  nickname: '微信用户_Lu',
  avatarUrl: null,
  providers: ['wechat'],
  emailVerified: false,
  createdAt: '2026-03-11T00:00:00.000Z',
  wechatOpenId: 'ox_mock_openid_001',
})

export function findByEmail(email: string) {
  return users.get(email.trim().toLowerCase())
}

export function findByWechatOpenId(openId: string) {
  for (const u of users.values()) if (u.wechatOpenId === openId) return u
  return undefined
}

export function createUser(input: { email: string; password: string; nickname: string }) {
  return addUser({
    id: `u-${users.size + 1}`,
    email: input.email.trim(),
    password: input.password,
    nickname: input.nickname.trim(),
    avatarUrl: null,
    providers: ['password'],
    // 按 F-19-03：邮箱密码直接注册，不做验证环节
    emailVerified: false,
    createdAt: new Date().toISOString(),
  })
}

export function toPublicUser(u: StoredUser): AuthUser {
  const { password: _password, wechatOpenId: _openId, ...rest } = u
  return rest
}

/** 有效的会话 token → 用户邮箱 */
export const sessions = new Map<string, string>()

/** 密码重置 token → { email, 过期时间 } */
export const resetTokens = new Map<string, { email: string; expiresAt: number }>()

export const SESSION_TTL_MS = 7 * 24 * 3600 * 1000
export const RESET_TTL_MS = 30 * 60 * 1000

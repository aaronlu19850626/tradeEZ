import { createHash, randomBytes } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { and, eq, isNull } from 'drizzle-orm'
import { DB, type Database } from '../db/db.module.js'
import { refreshTokens } from '../db/schema/index.js'

/** access token 载荷。sub 为用户 id */
export interface JwtPayload {
  sub: string
  email: string
}

/**
 * 令牌服务。F-19-06
 *
 * access token 用 JWT 自校验、不落库；
 * refresh token 存哈希入库，原文只回给客户端 —— 库被读也无法直接冒用。
 */
@Injectable()
export class TokenService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** refresh token 存哈希而非原文，比对时对入参做同样的哈希 */
  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }

  private get refreshTtlMs() {
    const days = this.config.get<number>('JWT_REFRESH_TTL_DAYS') ?? 30
    return days * 24 * 3600 * 1000
  }

  async signAccessToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      // jsonwebtoken 的 expiresIn 用模板字面量类型收窄，配置里读出的宽 string 需断言
      expiresIn: (this.config.get<string>('JWT_ACCESS_TTL') ?? '15m') as `${number}m`,
    })
  }

  async verifyAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      })
    } catch {
      return null
    }
  }

  /** 签发 refresh token 并入库。返回原文，仅此一次可见 */
  async issueRefreshToken(userId: string, meta?: { userAgent?: string; ip?: string }) {
    const token = randomBytes(48).toString('base64url')
    const expiresAt = new Date(Date.now() + this.refreshTtlMs)

    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash: this.hash(token),
      expiresAt,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    })

    return { token, expiresAt }
  }

  /** 校验 refresh token，返回其 userId。无效或已撤销返回 null */
  async verifyRefreshToken(token: string) {
    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, this.hash(token)), isNull(refreshTokens.revokedAt)))
      .limit(1)

    if (!row) return null
    if (row.expiresAt.getTime() < Date.now()) return null
    return row
  }

  /** 撤销单个 refresh token（登出） */
  async revokeRefreshToken(token: string) {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, this.hash(token)))
  }

  /**
   * 撤销该用户全部 refresh token。
   * 重置密码后调用 —— 其他设备上的登录必须失效（F-19-04）。
   */
  async revokeAllForUser(userId: string) {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)))
  }
}

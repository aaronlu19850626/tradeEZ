import { randomBytes, createHash } from 'node:crypto'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { hash as argonHash, verify as argonVerify } from '@node-rs/argon2'
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { AuthSession, AuthUser, LoginInput, RegisterInput } from '@tradeez/shared'
import { DB, type Database } from '../db/db.module.js'
import { passwordResetTokens, users } from '../db/schema/index.js'
import { TokenService } from './token.service.js'

/** 密码重置链接有效期：30 分钟（F-19-04） */
const RESET_TTL_MS = 30 * 60 * 1000

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly tokens: TokenService,
  ) {}

  /** 邮箱大小写不敏感查找。注册与登录都经由此处，口径一致 */
  private async findByEmail(email: string) {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(sql`lower(${users.email}) = lower(${email.trim()})`, isNull(users.deletedAt)))
      .limit(1)
    return row
  }

  /** 剥掉密码哈希等内部字段，只回可公开的用户信息 */
  private toPublic(row: typeof users.$inferSelect): AuthUser {
    return {
      id: row.id,
      email: row.email,
      nickname: row.nickname,
      avatarUrl: row.avatarUrl,
      providers: row.passwordHash ? ['password'] : [],
      emailVerified: row.emailVerified,
      createdAt: row.createdAt.toISOString(),
    }
  }

  private async buildSession(
    row: typeof users.$inferSelect,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthSession & { refreshToken: string }> {
    const accessToken = await this.tokens.signAccessToken({ sub: row.id, email: row.email })
    const refresh = await this.tokens.issueRefreshToken(row.id, meta)

    return {
      token: accessToken,
      // 前端据此判断是否需要重新登录，与 access token 的有效期对齐
      expiresAt: Date.now() + 15 * 60 * 1000,
      user: this.toPublic(row),
      refreshToken: refresh.token,
    }
  }

  /** F-19-02 登录 */
  async login(input: LoginInput, meta?: { userAgent?: string; ip?: string }) {
    const row = await this.findByEmail(input.email)

    /**
     * 不区分「账号不存在」与「密码错误」，两种情况返回同一句提示。
     * 否则攻击者可用登录接口枚举出哪些邮箱已注册。
     */
    const invalid = new UnauthorizedException('电子邮件地址或密码不正确')
    if (!row?.passwordHash) throw invalid

    const ok = await argonVerify(row.passwordHash, input.password).catch(() => false)
    if (!ok) throw invalid

    return this.buildSession(row, meta)
  }

  /** F-19-03 注册。邮箱密码直接注册，不做邮箱验证环节 */
  async register(
    input: Omit<RegisterInput, 'confirmPassword' | 'agreed'>,
    meta?: { userAgent?: string; ip?: string },
  ) {
    if (await this.findByEmail(input.email)) {
      throw new ConflictException('该电子邮件地址已注册')
    }

    const passwordHash = await argonHash(input.password)
    const [row] = await this.db
      .insert(users)
      .values({
        email: input.email.trim(),
        passwordHash,
        nickname: input.nickname.trim(),
      })
      .returning()

    return this.buildSession(row, meta)
  }

  /**
   * F-19-04 发送密码重置链接。
   * 无论账号是否存在都返回成功 —— 与登录同理，避免账号枚举。
   */
  async forgotPassword(email: string) {
    const row = await this.findByEmail(email)
    if (!row) return { sent: true }

    const token = randomBytes(32).toString('base64url')
    await this.db.insert(passwordResetTokens).values({
      userId: row.id,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    })

    /**
     * 邮件服务尚未接入，先打日志。
     * 接入后此处替换为发信调用，链接形如 https://tradeez.cn/reset-password?token=xxx
     */
    this.logger.warn(`[未接入邮件服务] ${row.email} 的密码重置 token：${token}`)

    return { sent: true }
  }

  private async findResetToken(token: string) {
    const [row] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, createHash('sha256').update(token).digest('hex')),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .limit(1)

    if (!row || row.expiresAt.getTime() < Date.now()) return null
    return row
  }

  /** 校验重置链接。进入重置页时先调，无效则提示重新申请 */
  async verifyResetToken(token: string) {
    const row = await this.findResetToken(token)
    if (!row) return { valid: false as const }

    const [user] = await this.db.select().from(users).where(eq(users.id, row.userId)).limit(1)
    return { valid: true as const, email: user?.email }
  }

  /** F-19-04 重置密码 */
  async resetPassword(token: string, password: string) {
    const row = await this.findResetToken(token)
    if (!row) throw new BadRequestException('重置链接已失效，请重新申请')

    const passwordHash = await argonHash(password)

    await this.db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, row.userId))
      // token 一次性
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, row.id))
    })

    // 改密后其他设备上的登录必须失效
    await this.tokens.revokeAllForUser(row.userId)

    return { ok: true }
  }

  /** 用 refresh token 换新的 access token */
  async refresh(refreshToken: string) {
    const row = await this.tokens.verifyRefreshToken(refreshToken)
    if (!row) throw new UnauthorizedException('登录已过期，请重新登录')

    const [user] = await this.db.select().from(users).where(eq(users.id, row.userId)).limit(1)
    if (!user) throw new UnauthorizedException('登录已过期，请重新登录')

    return this.buildSession(user)
  }

  async logout(refreshToken?: string) {
    if (refreshToken) await this.tokens.revokeRefreshToken(refreshToken)
  }

  /** 取当前用户，用于校验持久化的 token 是否仍有效 */
  async me(userId: string) {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1)

    if (!row) throw new UnauthorizedException('未登录或会话已过期')
    return this.toPublic(row)
  }
}

import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/** 用户与认证相关表。对应需求 F-1-01、F-19 */

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    /** argon2id 哈希。仅第三方登录的账号此列为 null */
    passwordHash: text('password_hash'),
    nickname: text('nickname').notNull(),
    avatarUrl: text('avatar_url'),
    emailVerified: boolean('email_verified').notNull().default(false),

    timezone: text('timezone').notNull().default('Asia/Shanghai'),
    locale: text('locale').notNull().default('zh-CN'),
    displayCurrency: text('display_currency').notNull().default('USD'),
    dateFormat: text('date_format').notNull().default('YYYY-MM-DD'),
    /** 侧栏折叠、仪表盘组件布局、表格列配置等 UI 偏好 */
    uiPrefs: jsonb('ui_prefs').notNull().default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    // 邮箱大小写不敏感唯一：避免 A@x.com 与 a@x.com 注册成两个账号
    uniqueIndex('users_email_lower_idx').on(sql`lower(${t.email})`),
  ],
)

/** 第三方登录绑定。F-19-05，一个用户可绑定多个平台 */
export const userIdentities = pgTable(
  'user_identities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'wechat' 等
    /** 平台侧的唯一标识，微信为 unionid（跨应用稳定）或 openid */
    providerUserId: text('provider_user_id').notNull(),
    /** 平台返回的原始资料，便于排查与后续扩展 */
    profile: jsonb('profile').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('user_identities_provider_uid_idx').on(t.provider, t.providerUserId),
    index('user_identities_user_idx').on(t.userId),
  ],
)

/**
 * refresh token。存哈希而非原文，库被读也无法直接冒用。
 * access token 不落库，由 JWT 自校验。
 */
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    /** 轮换链：新 token 记录被它替换的上一个，便于检测重放 */
    replacedBy: uuid('replaced_by'),
    userAgent: text('user_agent'),
    ip: text('ip'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('refresh_tokens_hash_idx').on(t.tokenHash),
    index('refresh_tokens_user_idx').on(t.userId),
  ],
)

/** 密码重置 token。F-19-04，存哈希、一次性、30 分钟过期 */
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('password_reset_tokens_hash_idx').on(t.tokenHash),
    index('password_reset_tokens_user_idx').on(t.userId),
  ],
)

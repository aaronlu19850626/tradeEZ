/** 认证与用户态类型。对应需求 F-19 */

export interface AuthUser {
  id: string
  email: string
  nickname: string
  avatarUrl: string | null
  /** 绑定方式，用于账户设置页展示与解绑 */
  providers: AuthProvider[]
  emailVerified: boolean
  createdAt: string
}

export type AuthProvider = 'password' | 'wechat'

export interface AuthSession {
  token: string
  /** 过期时间戳（毫秒），前端据此判断是否需要重新登录 */
  expiresAt: number
  user: AuthUser
}

/** 微信扫码状态机。F-19-05 */
export type WechatQrStatus =
  | 'pending' // 已生成，等待扫码
  | 'scanned' // 已扫码，等待手机端确认
  | 'confirmed' // 已确认，可换取会话
  | 'expired' // 二维码过期
  | 'canceled' // 用户在手机端取消

export interface WechatQrTicket {
  ticket: string
  /** 二维码图案的载荷，mock 阶段用它渲染占位图形 */
  qrPayload: string
  expiresAt: number
}

export interface WechatQrState {
  status: WechatQrStatus
  /** confirmed 时返回，用于换取会话 */
  authCode?: string
  /** scanned 后可拿到微信昵称头像，用于弹窗内提示「XXX 已扫码」 */
  nickname?: string
  avatarUrl?: string
}

/** 在线询问。F-19-07 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'agent'
  content: string
  createdAt: string
  /** 客服端显示的署名，如「支持助手 · AI」 */
  authorLabel?: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  /** 是否已转人工 */
  escalated: boolean
}

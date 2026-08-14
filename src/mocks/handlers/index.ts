import { authHandlers } from './auth'
import { supportHandlers } from './support'
import { tradingHandlers } from './trading'

/** 认证放在最前，避免被其他 handler 的宽匹配抢先命中 */
export const handlers = [...authHandlers, ...supportHandlers, ...tradingHandlers]

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, AuthUser } from '@tradeez/shared'

/**
 * 登录态。F-19-01
 * token 持久化到 localStorage，刷新后免登录；过期由 isValid 判断。
 *
 * 注：生产环境更稳妥的做法是 refresh token 存 httpOnly cookie、
 * access token 只放内存。当前为 mock 阶段的简化实现，后端接入时需一并调整。
 */
interface AuthState {
  token: string | null
  expiresAt: number | null
  refreshToken: string | null
  user: AuthUser | null
  setSession: (s: AuthSession) => void
  updateUser: (patch: Partial<AuthUser>) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      expiresAt: null,
      refreshToken: null,
      user: null,
      setSession: ({ token, expiresAt, user, refreshToken }) =>
        set({ token, expiresAt, user, refreshToken: refreshToken ?? null }),
      updateUser: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : {})),
      clear: () => set({ token: null, expiresAt: null, refreshToken: null, user: null }),
    }),
    { name: 'tradeez.auth' },
  ),
)

/** 会话是否有效。组件内用 selector 订阅，避免整店重渲染 */
export function isSessionValid(s: Pick<AuthState, 'token' | 'expiresAt'>) {
  return Boolean(s.token && s.expiresAt && s.expiresAt > Date.now())
}

/** 供非组件环境（如请求层）读取当前 token */
export function getAuthToken() {
  const s = useAuthStore.getState()
  return isSessionValid(s) ? s.token : null
}

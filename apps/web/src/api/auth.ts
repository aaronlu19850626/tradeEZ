import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from './client'
import { useAuthStore } from '@/stores/auth-store'
import type {
  AuthSession,
  AuthUser,
  WechatQrState,
  WechatQrTicket,
} from '@/types/auth'
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
} from '@/lib/validation'

/** 认证接口。F-19 */

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<AuthSession>('/auth/login', input),
    onSuccess: setSession,
  })
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: (input: Omit<RegisterInput, 'confirmPassword' | 'agreed'>) =>
      api.post<AuthSession>('/auth/register', input),
    onSuccess: setSession,
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      api.post<{ sent: boolean }>('/auth/forgot-password', input),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      api.post<{ ok: boolean }>('/auth/reset-password', input),
  })
}

/** 校验重置链接中的 token 是否有效，进入重置页时先调 */
export function useVerifyResetToken(token: string | null) {
  return useQuery({
    queryKey: ['reset-token', token],
    queryFn: () => api.get<{ valid: boolean; email?: string }>('/auth/reset-token', { token: token! }),
    enabled: Boolean(token),
    retry: false,
  })
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear)
  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    // 即便接口失败也清本地会话，避免用户卡在登录态
    onSettled: clear,
  })
}

/** 微信扫码：申请二维码 ticket。F-19-05 */
export function useWechatQrTicket(enabled: boolean) {
  return useQuery({
    queryKey: ['wechat-qr-ticket', enabled],
    queryFn: () => api.post<WechatQrTicket>('/auth/wechat/qrcode'),
    enabled,
    // 每次打开弹窗都要新二维码，不复用缓存
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

/** 轮询扫码状态。confirmed / expired / canceled 后停止 */
export function useWechatQrStatus(ticket: string | undefined) {
  return useQuery({
    queryKey: ['wechat-qr-status', ticket],
    queryFn: () => api.get<WechatQrState>('/auth/wechat/status', { ticket: ticket! }),
    enabled: Boolean(ticket),
    refetchInterval: (q) => {
      const s = q.state.data?.status
      return s === 'pending' || s === 'scanned' ? 1200 : false
    },
    gcTime: 0,
  })
}

/** 用 authCode 换会话 */
export function useWechatExchange() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: (authCode: string) =>
      api.post<AuthSession>('/auth/wechat/exchange', { authCode }),
    onSuccess: setSession,
  })
}

/** 拉当前用户，用于校验持久化的 token 是否仍有效 */
export function useCurrentUser(enabled: boolean) {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.get<AuthUser>('/auth/me'),
    enabled,
    retry: false,
  })
}

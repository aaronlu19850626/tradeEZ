import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { setUnauthorizedHandler } from '@/api/client'
import { isSessionValid, useAuthStore } from '@/stores/auth-store'

/**
 * 路由守卫。F-19-06
 * 未登录或会话过期时跳登录页，并记下原路径，登录后回跳。
 */
export function RequireAuth() {
  const location = useLocation()
  const valid = useAuthStore(isSessionValid)
  const clear = useAuthStore((s) => s.clear)

  // 接口返回 401 时清会话，交由本组件重新渲染并跳转
  useEffect(() => setUnauthorizedHandler(clear), [clear])

  if (!valid) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/** 已登录时访问登录/注册页则直接进应用，避免重复登录 */
export function RedirectIfAuthed() {
  const valid = useAuthStore(isSessionValid)
  if (valid) return <Navigate to="/journal/dashboard" replace />
  return <Outlet />
}

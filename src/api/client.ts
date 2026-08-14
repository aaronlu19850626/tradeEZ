/**
 * 统一请求层。业务代码只调用这里，走真实 fetch('/api/...')。
 * mock 阶段由 MSW 在 Service Worker 层拦截；后端就绪后关掉 MSW 即可，本文件无需改动。
 */

import { getAuthToken } from '@/stores/auth-store'

const BASE = import.meta.env.VITE_API_BASE ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** 401 时清理本地会话，由路由守卫接管跳转，避免各调用点自行处理 */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    // 后端返回 { message } 时优先取它，否则退回原始文本
    const raw = await res.text().catch(() => '')
    let message = raw
    try {
      const parsed = JSON.parse(raw) as { message?: string }
      if (parsed.message) message = parsed.message
    } catch {
      // 非 JSON 响应，保持原始文本
    }
    if (res.status === 401) onUnauthorized?.()
    throw new ApiError(res.status, message || `请求失败：${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function withQuery(path: string, query?: Record<string, string | number | undefined>) {
  if (!query) return path
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') usp.set(k, String(v))
  }
  const qs = usp.toString()
  return qs ? `${path}?${qs}` : path
}

export const api = {
  get: <T>(path: string, query?: Record<string, string | number | undefined>) =>
    request<T>(withQuery(path, query)),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

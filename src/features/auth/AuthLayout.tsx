import { Outlet } from 'react-router-dom'
import { ChatWidget } from '@/features/support/ChatWidget'

/**
 * 认证页外壳。F-19-01
 * 对齐截图：浅色底 + 左上/右下淡紫渐晕，卡片居中，右下角挂在线询问入口。
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-white px-4 py-10">
      {/* 渐晕背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-brand-200/45 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-40 size-[520px] rounded-full bg-brand-300/35 blur-3xl"
      />

      <div className="relative w-full max-w-[26rem]">
        <Outlet />
      </div>

      <ChatWidget />
    </div>
  )
}

/** 认证卡片：Logo + 标题 + 副标题 + 内容 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white">
          EZ
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
    </div>
  )
}

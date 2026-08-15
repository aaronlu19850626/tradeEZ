import { createPortal } from 'react-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FlyoutPos } from '@/hooks/useNavFlyout'

/**
 * 收缩态菜单的悬停浮窗。
 *
 * 整颗胶囊由这一个元素渲染（图标 + 文字），直接盖在原图标格上：
 * 若用「图标格 + 右侧浮窗」两段拼接，圆角与直角之间必然露出底色缝隙。
 */
export function NavFlyout({
  pos,
  label,
  icon: Icon,
  tone,
}: {
  pos: FlyoutPos | null
  label: string
  icon: LucideIcon
  tone: 'dark' | 'light'
}) {
  if (!pos) return null

  return createPortal(
    <span
      className={cn(
        'pointer-events-none fixed z-50 flex items-center rounded-xl pr-4 text-sm whitespace-nowrap',
        'animate-flyout',
        tone === 'dark'
          ? 'bg-shell-hover text-white'
          : 'bg-nav-active font-medium text-nav-active-fg',
      )}
      style={{ top: pos.top, left: pos.left, height: pos.height }}
    >
      {/* 图标格与锚点等宽，文字自然接在其右侧，中间无空隙 */}
      <span className="grid shrink-0 place-items-center" style={{ width: pos.width }}>
        <Icon className="size-[19px] scale-110" />
      </span>
      {label}
    </span>,
    document.body,
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { useNavFlyout } from '@/hooks/useNavFlyout'
import { useUIStore } from '@/stores/ui-store'
import { NavFlyout } from './NavFlyout'
import { JOURNAL_NAV, PRODUCT_NAV, PRODUCT_NAV_FOOTER, type NavItem } from '@/config/nav'

/**
 * 产品级导航（深色条）。F-1-04
 *
 * 三种形态：
 * - 隐藏：汉堡键切换，整条收掉（宽度归零）
 * - 展开：图标 + 文字，仅首页
 * - 仅图标：其他页面，悬停时滑出整颗胶囊（图标 + 文字）覆盖图标格
 */
export function ProductRail() {
  const t = useT()
  const hidden = useUIStore((s) => s.sidebarHidden)
  const expanded = useLocation().pathname === '/'

  return (
    <nav
      aria-label={t.common.mainNav}
      aria-hidden={hidden}
      className={cn(
        'flex shrink-0 flex-col bg-shell-900',
        'transition-[width,opacity] duration-300 ease-in-out',
        hidden ? 'pointer-events-none w-0 overflow-hidden opacity-0' : 'opacity-100',
        !hidden && (expanded ? 'w-[190px]' : 'w-[52px]'),
      )}
    >
      <div className={cn('flex-1 space-y-1 py-3', expanded ? 'px-2' : 'px-1.5')}>
        {PRODUCT_NAV.map((item) => (
          <RailLink key={item.key} item={item} expanded={expanded} />
        ))}
      </div>
      <div className={cn('space-y-1 pb-3', expanded ? 'px-2' : 'px-1.5')}>
        {PRODUCT_NAV_FOOTER.map((item) => (
          <RailLink key={item.key} item={item} expanded={expanded} />
        ))}
      </div>
    </nav>
  )
}

/** 深色条的菜单项 */
function RailLink({ item, expanded }: { item: NavItem; expanded: boolean }) {
  const t = useT()
  const flyout = useNavFlyout()
  const label = t.nav[item.labelKey]

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onMouseEnter={expanded ? undefined : (e) => flyout.show(e.currentTarget)}
      onMouseLeave={flyout.hide}
      className={({ isActive }) =>
        cn(
          'group relative flex h-10 items-center rounded-xl text-sm transition-colors duration-150',
          expanded ? 'gap-3 px-2.5' : 'w-10 justify-center',
          isActive
            ? 'bg-shell-active text-white'
            : 'text-white/55 hover:bg-shell-hover hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative grid shrink-0 place-items-center">
            <item.icon
              className={cn(
                'size-[19px] transition-transform duration-150 group-hover:scale-110',
                isActive && 'scale-105',
              )}
            />
            {item.dot && (
              <span className="absolute -top-0.5 -right-1 size-1.5 rounded-full bg-red-500" />
            )}
            {item.badge && <BetaBadge />}
          </span>

          {expanded && <span className="truncate">{label}</span>}

          {!expanded && (
            <NavFlyout pos={flyout.pos} label={label} icon={item.icon} tone="dark" />
          )}
        </>
      )}
    </NavLink>
  )
}

/**
 * 模块级导航（浅色面板）。进入交易分析后显示。
 * 未收缩时显示文字，收缩时退化为图标条并在悬停时滑出胶囊。
 */
export function JournalPanel() {
  const t = useT()
  const hidden = useUIStore((s) => s.sidebarHidden)
  const expanded = !hidden

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col border-r border-line transition-[width] duration-300 ease-in-out',
        expanded ? 'w-[190px] px-3' : 'w-[64px] px-2.5',
      )}
    >
      {/* 主行动按钮。F-2-01 添加交易入口 */}
      <button
        type="button"
        title={expanded ? undefined : t.common.addTrade}
        className={cn(
          'mt-3 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 font-medium text-white transition-colors duration-150 hover:bg-brand-600',
          expanded ? 'w-full py-3 text-sm' : 'size-11 self-center',
        )}
      >
        <Plus className={expanded ? 'size-[18px]' : 'size-5'} />
        {expanded && t.common.addTrade}
      </button>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto pb-3 scrollbar-thin">
        {JOURNAL_NAV.map((group, i) => (
          <div key={group.key} className={cn('space-y-0.5', i > 0 && 'border-t border-line pt-3')}>
            {group.items.map((item) => (
              <PanelLink key={item.key} item={item} expanded={expanded} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 浅色面板的菜单项 */
function PanelLink({ item, expanded }: { item: NavItem; expanded: boolean }) {
  const t = useT()
  const flyout = useNavFlyout()
  const label = t.nav[item.labelKey]

  return (
    <NavLink
      to={item.path}
      onMouseEnter={expanded ? undefined : (e) => flyout.show(e.currentTarget)}
      onMouseLeave={flyout.hide}
      className={({ isActive }) =>
        cn(
          'group relative flex h-11 items-center rounded-xl text-sm transition-colors duration-150',
          expanded ? 'gap-3 px-3' : 'mx-auto w-11 justify-center',
          isActive
            ? 'bg-nav-active font-medium text-nav-active-fg'
            : 'text-fg-muted hover:bg-nav-hover hover:text-nav-active-fg',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              'size-[19px] shrink-0 transition-transform duration-150 group-hover:scale-110',
              isActive && 'scale-105',
            )}
          />
          {expanded && <span className="truncate">{label}</span>}

          {!expanded && (
            <NavFlyout pos={flyout.pos} label={label} icon={item.icon} tone="light" />
          )}
        </>
      )}
    </NavLink>
  )
}

/** BETA 角标。压在菜单图标右下角，展开态也不跟到文字后面 */
function BetaBadge() {
  const t = useT()
  return (
    <span
      className="pointer-events-none absolute -right-1.5 -bottom-1 rounded-[2px] bg-amber-400 px-[1.5px] text-[5.5px] leading-[1.6] font-bold tracking-[-0.03em] text-amber-950"
      aria-label={t.common.beta}
    >
      BETA
    </span>
  )
}

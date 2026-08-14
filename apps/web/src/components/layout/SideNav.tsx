import { NavLink, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import {
  JOURNAL_NAV,
  PRODUCT_NAV,
  PRODUCT_NAV_FOOTER,
  type NavItem,
} from '@/config/nav'

/** 侧边栏。F-1-04 两层导航：日志模块内显示模块级导航 + 最左侧图标细条 */
export function SideNav() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const inJournal = useLocation().pathname.startsWith('/journal')

  return (
    <div className="flex shrink-0">
      {inJournal && <IconRail />}
      <nav
        className={cn(
          'flex flex-col border-r border-slate-200 bg-white transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-56',
        )}
      >
        {inJournal ? (
          <JournalNav collapsed={collapsed} />
        ) : (
          <ProductNav collapsed={collapsed} />
        )}
      </nav>
    </div>
  )
}

/** 最左侧图标细条：日志模块内用于切回其他产品 */
function IconRail() {
  return (
    <div className="flex w-12 flex-col items-center gap-1 border-r border-white/5 bg-shell-900 py-3">
      {PRODUCT_NAV.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          title={item.label}
          className={({ isActive }) =>
            cn(
              'grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white',
              isActive && 'bg-white/15 text-white',
            )
          }
        >
          <item.icon className="size-[18px]" />
        </NavLink>
      ))}
    </div>
  )
}

function ProductNav({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      <div className="flex-1 space-y-1 p-2">
        {PRODUCT_NAV.map((item) => (
          <NavItemLink key={item.key} item={item} collapsed={collapsed} />
        ))}
      </div>
      <div className="space-y-1 border-t border-slate-200 p-2">
        {PRODUCT_NAV_FOOTER.map((item) => (
          <NavItemLink key={item.key} item={item} collapsed={collapsed} />
        ))}
      </div>
    </>
  )
}

function JournalNav({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-2 scrollbar-thin">
      {/* 主行动按钮。F-2-01 添加交易入口 */}
      <button
        type="button"
        className={cn(
          'flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600',
          collapsed && 'px-0',
        )}
        title="添加交易"
      >
        <Plus className="size-4" />
        {!collapsed && '添加交易'}
      </button>

      {JOURNAL_NAV.map((group, i) => (
        <div
          key={group.key}
          className={cn('space-y-0.5', i > 0 && 'border-t border-slate-200 pt-3')}
        >
          {group.items.map((item) => (
            <NavItemLink key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>
      ))}
    </div>
  )
}

function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100',
          isActive && 'bg-brand-50 font-medium text-brand-700',
          collapsed && 'justify-center px-0',
        )
      }
    >
      <item.icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded bg-amber-400 px-1 text-[9px] font-bold text-amber-950">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

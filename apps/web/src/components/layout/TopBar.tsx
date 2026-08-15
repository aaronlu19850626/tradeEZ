import { Bell, Menu, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { RippleButton } from '@/components/ui/RippleButton'
import { useT } from '@/i18n/useT'
import { useUIStore } from '@/stores/ui-store'
import { UserMenu } from './UserMenu'

/**
 * 顶栏。F-1-03
 * 语言切换不在此处，收在用户菜单里（顶栏只留 AI、通知、用户三项）。
 */
export function TopBar() {
  const t = useT()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const hidden = useUIStore((s) => s.sidebarHidden)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 bg-shell-900 px-4 text-white">
      <RippleButton
        type="button"
        onClick={toggleSidebar}
        aria-label={hidden ? t.common.showSidebar : t.common.hideSidebar}
        aria-expanded={!hidden}
        className="rounded-lg p-2 text-white/75 transition-colors duration-150 hover:bg-white/12 hover:text-white"
      >
        <Menu className="size-5" />
      </RippleButton>

      <Link to="/" aria-label="tradeEZ">
        <Logo tone="light" size="lg" />
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pr-4 pl-2 text-sm font-medium hover:bg-white/15"
        >
          <span className="grid size-6 place-items-center rounded-full bg-brand-500">
            <Sparkles className="size-3.5" />
          </span>
          {t.common.ezAi}
        </button>

        <button
          type="button"
          aria-label={t.common.notifications}
          className="relative rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Bell className="size-5" />
          <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-loss text-[10px] font-bold">
            2
          </span>
        </button>

        <UserMenu />
      </div>
    </header>
  )
}

import { Bell, Menu, Sparkles, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/stores/ui-store'

/** 顶栏。F-1-03 */
export function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 bg-shell-900 px-4 text-white">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="折叠侧边栏"
        className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
      >
        <Menu className="size-5" />
      </button>

      <Link to="/" className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-500 text-sm font-bold">
          EZ
        </span>
        <span className="text-[15px] font-semibold tracking-wide">TradeEZ</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pr-4 pl-2 text-sm font-medium hover:bg-white/15"
        >
          <span className="grid size-6 place-items-center rounded-full bg-brand-500">
            <Sparkles className="size-3.5" />
          </span>
          EZ AI
        </button>

        <button
          type="button"
          aria-label="通知"
          className="relative rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Bell className="size-5" />
          <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-loss text-[10px] font-bold">
            2
          </span>
        </button>

        <button
          type="button"
          aria-label="用户菜单"
          className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <User className="size-5" />
        </button>
      </div>
    </header>
  )
}

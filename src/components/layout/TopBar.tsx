import { useEffect, useState } from 'react'
import { Bell, LogOut, Menu, Sparkles, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogout } from '@/api/auth'
import { useAuthStore } from '@/stores/auth-store'
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

        <UserMenu />
      </div>
    </header>
  )
}

/** 用户菜单。含登出（F-19-06） */
function UserMenu() {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [open])

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="用户菜单"
        aria-expanded={open}
        className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
      >
        <User className="size-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-slate-700 shadow-lg">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-medium">{user?.nickname ?? '未登录'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <MenuItem label="账户设置" onClick={() => setOpen(false)} />
          <MenuItem label="订阅与计费" onClick={() => setOpen(false)} />
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              await logout.mutateAsync().catch(() => {})
              navigate('/login', { replace: true })
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-loss hover:bg-slate-50"
          >
            <LogOut className="size-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  )
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
    >
      {label}
    </button>
  )
}

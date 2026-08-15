import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CircleHelp,
  ExternalLink,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User,
  Users,
} from 'lucide-react'
import { useLogout } from '@/api/auth'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { useThemeStore } from '@/stores/theme-store'
import { LocaleSwitch } from './LocaleSwitch'

/** 顶栏右上角用户菜单：主题、语言、帮助入口与登出。F-1-03 */
export function UserMenu() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const logout = useLogout()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.common.userMenu}
        aria-expanded={open}
        className="grid size-8 place-items-center rounded-full bg-white/10 text-white/85 hover:bg-white/15 hover:text-white"
      >
        <User className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-card text-fg shadow-xl">
          <div className="px-3 py-2">
            <Row label={t.menu.theme}>
              <ThemeToggle />
            </Row>
            <Row label={t.menu.language}>
              <LocaleSwitch />
            </Row>
          </div>

          <div className="border-t border-line py-1">
            <Item icon={CircleHelp} label={t.menu.help} onClick={() => setOpen(false)} />
            <Item icon={Sparkles} label={t.menu.changelog} external />
            <Item icon={Users} label={t.menu.community} external />
            <Item
              icon={Settings}
              label={t.menu.settings}
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
            />
          </div>

          <div className="border-t border-line py-1">
            <button
              type="button"
              onClick={async () => {
                setOpen(false)
                await logout.mutateAsync().catch(() => {})
                navigate('/login', { replace: true })
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-loss hover:bg-raised"
            >
              <LogOut className="size-4" />
              {t.menu.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-10 items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  )
}

/** 明暗两枚图标，当前项高亮 */
function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
      {(['dark', 'light'] as const).map((mode) => {
        const Icon = mode === 'dark' ? Moon : Sun
        const active = theme === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            aria-label={mode === 'dark' ? t_dark : t_light}
            aria-pressed={active}
            className={cn(
              'grid size-6 place-items-center rounded-full transition-colors',
              active ? 'bg-brand-500 text-white' : 'text-fg-subtle hover:text-fg',
            )}
          >
            <Icon className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}

// 主题按钮的无障碍名称，与界面语言无关的固定词
const t_dark = 'Dark'
const t_light = 'Light'

function Item({
  icon: Icon,
  label,
  external,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  external?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-raised"
    >
      <Icon className="size-4 text-fg-subtle" />
      <span className="flex-1">{label}</span>
      {external && <ExternalLink className="size-3.5 text-fg-subtle" />}
    </button>
  )
}

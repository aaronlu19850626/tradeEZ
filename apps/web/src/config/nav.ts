import {
  Bot,
  CalendarDays,
  CircleHelp,
  CircleUserRound,
  FileText,
  Files,
  Gift,
  GraduationCap,
  House,
  LayoutDashboard,
  Newspaper,
  Notebook,
  PenLine,
  PlayCircle,
  Target,
  TrendingUp,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import type { NavLabelKey, TransDict } from '@/i18n/locales'

/**
 * 导航配置。F-1-04
 * 菜单文案不写死在此处，只存字典键，语言切换时无需改配置。
 */

export interface NavItem {
  key: string
  labelKey: NavLabelKey
  path: string
  icon: LucideIcon
  /** BETA 角标 */
  badge?: boolean
  /** 未读红点 */
  dot?: boolean
}

export interface NavGroup {
  key: string
  items: NavItem[]
}

/** 产品级导航上部 */
export const PRODUCT_NAV: NavItem[] = [
  { key: 'home', labelKey: 'home', path: '/', icon: House },
  { key: 'journal', labelKey: 'journal', path: '/journal/dashboard', icon: PenLine },
  { key: 'agents', labelKey: 'agents', path: '/agents', icon: Bot },
  { key: 'mentor', labelKey: 'mentor', path: '/mentor', icon: CircleUserRound },
  { key: 'news', labelKey: 'news', path: '/news', icon: Newspaper, badge: true },
]

/** 产品级导航下部 */
export const PRODUCT_NAV_FOOTER: NavItem[] = [
  { key: 'contact', labelKey: 'contact', path: '/contact', icon: CircleHelp, dot: true },
  { key: 'university', labelKey: 'university', path: '/university', icon: GraduationCap },
  { key: 'referral', labelKey: 'referral', path: '/referral', icon: Gift },
]

/** 模块级导航。进入交易分析后显示，分两组 */
export const JOURNAL_NAV: NavGroup[] = [
  {
    key: 'main',
    items: [
      { key: 'dashboard', labelKey: 'dashboard', path: '/journal/dashboard', icon: LayoutDashboard },
      { key: 'day-view', labelKey: 'dayView', path: '/journal/day-view', icon: CalendarDays },
      { key: 'trades', labelKey: 'trades', path: '/journal/trades', icon: Waypoints },
      { key: 'notebook', labelKey: 'notebook', path: '/journal/notebook', icon: Notebook },
      { key: 'reports', labelKey: 'reports', path: '/journal/reports', icon: FileText },
      { key: 'strategies', labelKey: 'strategies', path: '/journal/strategies', icon: TrendingUp },
    ],
  },
  {
    key: 'tools',
    items: [
      { key: 'replay', labelKey: 'replay', path: '/journal/replay', icon: PlayCircle },
      { key: 'progress', labelKey: 'progress', path: '/journal/progress', icon: Target },
      { key: 'resources', labelKey: 'resources', path: '/journal/resources', icon: Files },
    ],
  },
]

/** 未列入菜单但需要标题的路由 */
const EXTRA_TITLES: Record<string, NavLabelKey> = {
  '/backtesting': 'backtesting',
  '/prop-sync': 'propSync',
  '/settings': 'settings',
  '/login': 'login',
  '/register': 'register',
  '/forgot-password': 'forgotPassword',
  '/reset-password': 'resetPassword',
}

/**
 * 由路径取页面名，用于浏览器标签标题。
 * 二级菜单优先：`/journal/dashboard` 既是「交易分析」的入口路径也是「仪表盘」自身路径，
 * 取后者才与页面上高亮的菜单项一致。
 */
export function findNavTitle(pathname: string, t: TransDict): string | undefined {
  const journalItems = JOURNAL_NAV.flatMap((g) => g.items)
  const productItems = [...PRODUCT_NAV, ...PRODUCT_NAV_FOOTER]

  const hit = [...journalItems, ...productItems]
    .filter((i) => i.path !== '/' && pathname.startsWith(i.path))
    .sort((a, b) => b.path.length - a.path.length)[0]

  if (hit) return t.nav[hit.labelKey]
  if (pathname === '/') return t.nav.home

  const extra = EXTRA_TITLES[pathname]
  return extra ? t.nav[extra] : undefined
}

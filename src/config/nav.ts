import {
  BookOpen,
  Bot,
  CalendarDays,
  Files,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LineChart,
  type LucideIcon,
  MessageCircleQuestion,
  Notebook,
  PlayCircle,
  Rewind,
  Share2,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  path: string
  icon: LucideIcon
  badge?: string
}

export interface NavGroup {
  key: string
  items: NavItem[]
}

/** 产品级导航（F-1-04）。首页显示 */
export const PRODUCT_NAV: NavItem[] = [
  { key: 'home', label: '首页', path: '/', icon: Home },
  { key: 'journal', label: '日志', path: '/journal/dashboard', icon: BookOpen },
  { key: 'backtesting', label: '回测', path: '/backtesting', icon: Rewind },
  { key: 'agents', label: '智能体', path: '/agents', icon: Bot },
  { key: 'mentor', label: '导师模式', path: '/mentor', icon: Users },
  { key: 'propsync', label: '自营账户同步', path: '/prop-sync', icon: Share2, badge: 'BETA' },
]

export const PRODUCT_NAV_FOOTER: NavItem[] = [
  { key: 'contact', label: '联系我们', path: '/contact', icon: MessageCircleQuestion },
  { key: 'university', label: '学院', path: '/university', icon: GraduationCap },
  { key: 'referral', label: '推荐计划', path: '/referral', icon: Share2 },
]

/** 模块级导航（F-1-04）。进入日志后显示，分两组 */
export const JOURNAL_NAV: NavGroup[] = [
  {
    key: 'main',
    items: [
      { key: 'dashboard', label: '仪表盘', path: '/journal/dashboard', icon: LayoutDashboard },
      { key: 'day-view', label: '日视图', path: '/journal/day-view', icon: CalendarDays },
      { key: 'trades', label: '交易列表', path: '/journal/trades', icon: LineChart },
      { key: 'notebook', label: '笔记本', path: '/journal/notebook', icon: Notebook },
      { key: 'reports', label: '报表', path: '/journal/reports', icon: FileText },
      { key: 'strategies', label: '策略', path: '/journal/strategies', icon: TrendingUp },
    ],
  },
  {
    key: 'tools',
    items: [
      { key: 'replay', label: '交易回放', path: '/journal/replay', icon: PlayCircle },
      { key: 'progress', label: '进度追踪', path: '/journal/progress', icon: Target },
      { key: 'resources', label: '资源', path: '/journal/resources', icon: Files },
    ],
  },
]

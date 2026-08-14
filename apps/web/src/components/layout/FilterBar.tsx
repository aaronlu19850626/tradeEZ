import { CalendarRange, ChevronDown, DollarSign, SlidersHorizontal, Wallet } from 'lucide-react'
import { useAccounts } from '@/api/queries'
import { useFilterStore, type DateRangePreset } from '@/stores/filter-store'

/**
 * 全局筛选器栏。F-1-05
 * 骨架阶段用原生 select 承载逻辑，后续替换为 shadcn/ui 的 Dropdown/Popover。
 */

const RANGE_LABELS: Record<DateRangePreset, string> = {
  today: '今日',
  thisWeek: '本周',
  thisMonth: '本月',
  thisQuarter: '本季',
  thisYear: '今年',
  all: '全部时间',
  custom: '自定义',
}

interface Props {
  /** 各页面控件组合略有差异，货币选择器只在部分页面出现 */
  showCurrency?: boolean
}

export function FilterBar({ showCurrency = true }: Props) {
  const { currency, datePreset, accountIds, setCurrency, setDatePreset, setAccountIds } =
    useFilterStore()
  const { data: accounts } = useAccounts()

  return (
    <div className="flex items-center gap-2">
      {showCurrency && (
        <Control icon={<DollarSign className="size-3.5" />}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
          >
            <option value="USD">USD</option>
            <option value="CNY">CNY</option>
            <option value="EUR">EUR</option>
          </select>
        </Control>
      )}

      {/* Filters 弹层（F-1-06）待接入 */}
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
      >
        <SlidersHorizontal className="size-3.5" />
        筛选
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>

      <Control icon={<CalendarRange className="size-3.5" />}>
        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
          className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
        >
          {Object.entries(RANGE_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </Control>

      <Control icon={<Wallet className="size-3.5" />}>
        <select
          value={accountIds[0] ?? ''}
          onChange={(e) => setAccountIds(e.target.value ? [e.target.value] : [])}
          className="max-w-36 cursor-pointer appearance-none bg-transparent pr-1 outline-none"
        >
          <option value="">全部账户</option>
          {accounts?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Control>
    </div>
  )
}

function Control({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
      <span className="text-slate-400">{icon}</span>
      {children}
    </div>
  )
}

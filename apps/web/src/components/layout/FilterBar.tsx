import { CalendarRange, ChevronDown, DollarSign, SlidersHorizontal, Wallet } from 'lucide-react'
import { useAccounts } from '@/api/queries'
import { useT } from '@/i18n/useT'
import type { TransDict } from '@/i18n/locales'
import { useFilterStore, type DateRangePreset } from '@/stores/filter-store'

/**
 * 全局筛选器栏。F-1-05
 * 骨架阶段用原生 select 承载逻辑，后续替换为 shadcn/ui 的 Dropdown/Popover。
 */

/** 日期预设 → 字典键。文案随语言切换，取值本身不变 */
const RANGE_KEYS: Record<DateRangePreset, keyof TransDict['filter']> = {
  today: 'today',
  thisWeek: 'thisWeek',
  thisMonth: 'thisMonth',
  thisQuarter: 'thisQuarter',
  thisYear: 'thisYear',
  all: 'allTime',
  custom: 'custom',
}

interface Props {
  /** 各页面控件组合略有差异，货币选择器只在部分页面出现 */
  showCurrency?: boolean
}

export function FilterBar({ showCurrency = true }: Props) {
  const { currency, datePreset, accountIds, setCurrency, setDatePreset, setAccountIds } =
    useFilterStore()
  const { data: accounts } = useAccounts()
  const t = useT()

  return (
    <div className="flex items-center gap-2">
      {showCurrency && (
        <Control icon={<DollarSign className="size-3.5" />}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label={t.filter.currency}
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
        className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-sm text-fg-muted hover:bg-page"
      >
        <SlidersHorizontal className="size-3.5" />
        {t.filter.filters}
        <ChevronDown className="size-3.5 text-fg-subtle" />
      </button>

      <Control icon={<CalendarRange className="size-3.5" />}>
        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
          aria-label={t.filter.dateRange}
          className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
        >
          {Object.entries(RANGE_KEYS).map(([value, key]) => (
            <option key={value} value={value}>
              {t.filter[key]}
            </option>
          ))}
        </select>
      </Control>

      <Control icon={<Wallet className="size-3.5" />}>
        <select
          value={accountIds[0] ?? ''}
          onChange={(e) => setAccountIds(e.target.value ? [e.target.value] : [])}
          aria-label={t.filter.account}
          className="max-w-36 cursor-pointer appearance-none bg-transparent pr-1 outline-none"
        >
          <option value="">{t.filter.allAccounts}</option>
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
    <div className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-sm text-fg-muted">
      <span className="text-fg-subtle">{icon}</span>
      {children}
    </div>
  )
}

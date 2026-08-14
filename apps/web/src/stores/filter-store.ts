import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 全局筛选器状态。F-1-05：跨页保持、刷新后恢复最近一次选择。
 * 骨架阶段只落地货币/日期范围/账户三项，Filters 弹层条件（F-1-06）后续接入。
 */

export type DateRangePreset =
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'thisQuarter'
  | 'thisYear'
  | 'all'
  | 'custom'

export interface FilterState {
  currency: string
  datePreset: DateRangePreset
  customStart: string | null
  customEnd: string | null
  accountIds: string[] // 空数组表示「全部账户」
  setCurrency: (c: string) => void
  setDatePreset: (p: DateRangePreset) => void
  setCustomRange: (start: string, end: string) => void
  setAccountIds: (ids: string[]) => void
  reset: () => void
}

const initial = {
  currency: 'USD',
  datePreset: 'all' as DateRangePreset,
  customStart: null,
  customEnd: null,
  accountIds: [] as string[],
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initial,
      setCurrency: (currency) => set({ currency }),
      setDatePreset: (datePreset) => set({ datePreset }),
      setCustomRange: (customStart, customEnd) =>
        set({ customStart, customEnd, datePreset: 'custom' }),
      setAccountIds: (accountIds) => set({ accountIds }),
      reset: () => set(initial),
    }),
    { name: 'tradeez.filters' },
  ),
)

/** 把筛选状态转成请求参数，供各接口统一携带 */
export function filtersToQuery(s: FilterState): Record<string, string> {
  const q: Record<string, string> = {
    currency: s.currency,
    range: s.datePreset,
  }
  if (s.datePreset === 'custom' && s.customStart && s.customEnd) {
    q.start = s.customStart
    q.end = s.customEnd
  }
  if (s.accountIds.length) q.accounts = s.accountIds.join(',')
  return q
}

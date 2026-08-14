import { Construction } from 'lucide-react'
import { FilterBar } from '@/components/layout/FilterBar'
import { PageHeader } from './PageHeader'

interface Props {
  title: string
  reqId: string
  /** 该页待实现的要点，取自需求文档 */
  notes?: string[]
  showFilterBar?: boolean
}

/** 页面占位。骨架阶段所有页面用它，逐页替换为真实实现 */
export function PlaceholderPage({ title, reqId, notes, showFilterBar }: Props) {
  return (
    <>
      <PageHeader
        title={title}
        reqId={reqId}
        actions={showFilterBar ? <FilterBar /> : undefined}
      />
      <div className="px-6 pb-8">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Construction className="size-5" />
            </span>
            <p className="text-sm font-medium text-slate-700">此页面待实现</p>
            <p className="max-w-md text-xs text-slate-500">
              骨架已就绪：布局、路由、全局筛选器与模拟接口均可用。确认结构后逐页填充内容。
            </p>
          </div>

          {notes?.length ? (
            <ul className="mx-auto mt-8 max-w-lg space-y-1.5 border-t border-slate-100 pt-6">
              {notes.map((n) => (
                <li key={n} className="flex gap-2 text-xs text-slate-500">
                  <span className="text-slate-300">·</span>
                  {n}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </>
  )
}

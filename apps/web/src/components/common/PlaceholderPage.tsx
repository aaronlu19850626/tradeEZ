import { Construction } from 'lucide-react'
import { FilterBar } from '@/components/layout/FilterBar'
import { useT } from '@/i18n/useT'
import type { NavLabelKey, NoteKey } from '@/i18n/locales'

/**
 * 占位页。列出该页待实现的需求条目，便于对照需求文档。
 * 页面真正实现后从 pages/placeholders.tsx 移出。
 */
export function PlaceholderPage({
  titleKey,
  reqId,
  noteKey,
  showFilterBar,
}: {
  titleKey: NavLabelKey
  reqId: string
  noteKey: NoteKey
  showFilterBar?: boolean
}) {
  const t = useT()

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 px-6 pt-5">
        <h1 className="text-xl font-semibold text-fg">{t.nav[titleKey]}</h1>
        <span className="rounded border border-line px-1.5 py-0.5 text-xs text-fg-subtle">
          {reqId}
        </span>
        {showFilterBar && (
          <div className="ml-auto">
            <FilterBar />
          </div>
        )}
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="rounded-2xl border border-dashed border-line px-6 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Construction className="size-5" />
            </span>
            <p className="mt-4 font-medium text-fg">{t.common.pageTodoTitle}</p>
            <p className="mt-2 text-sm text-fg-subtle">{t.common.pageTodoDesc}</p>

            <ul className="mt-6 space-y-1.5 border-t border-line pt-6 text-left text-sm text-fg-muted">
              {t.notes[noteKey].map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="text-fg-subtle">·</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

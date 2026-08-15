import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { FlagIcon } from '@/components/brand/FlagIcon'
import { cn } from '@/lib/utils'
import { LOCALES, LOCALE_META, type Locale } from '@/i18n/locales'
import { useLocaleStore } from '@/stores/locale-store'

/**
 * 语言切换（下拉式）。放在用户菜单内，不占顶栏位置。
 * 用下拉而非开关，语言数超过两种时无需改结构。
 */
export function LocaleSwitch() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const current = LOCALE_META[locale]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-line px-2 py-1',
          'text-xs font-medium text-fg transition-colors hover:bg-raised',
        )}
      >
        <FlagIcon locale={locale} />
        <span>{current.label}</span>
        <ChevronDown className="size-3.5 text-fg-subtle" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[132px] overflow-hidden rounded-lg border border-line bg-card py-1 shadow-lg"
        >
          {LOCALES.map((code: Locale) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === locale}
                onClick={() => {
                  setLocale(code)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs',
                  code === locale ? 'text-brand-700' : 'text-fg hover:bg-raised',
                )}
              >
                <FlagIcon locale={code} />
                <span className="flex-1">{LOCALE_META[code].label}</span>
                {code === locale && <Check className="size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LOCALES, type Locale } from '@/i18n/locales'

/** 界面语言。首次访问按浏览器语言推断，之后记住选择。F-1-07 */

function detect(): Locale {
  if (typeof navigator === 'undefined') return 'zh'
  const lang = navigator.language.toLowerCase()
  return LOCALES.find((l) => lang.startsWith(l)) ?? 'en'
}

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: detect(),
      setLocale: (locale) => {
        document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
        set({ locale })
      },
    }),
    {
      name: 'tradeez.locale',
      onRehydrateStorage: () => (state) => {
        if (state) document.documentElement.lang = state.locale === 'zh' ? 'zh-CN' : 'en'
      },
    },
  ),
)

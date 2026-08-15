import { DICT, type TransDict } from './locales'
import { useLocaleStore } from '@/stores/locale-store'

/** 取当前语言的文案字典。语言切换时订阅组件自动重渲染。 */
export function useT(): TransDict {
  const locale = useLocaleStore((s) => s.locale)
  return DICT[locale]
}

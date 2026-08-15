import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { findNavTitle } from '@/config/nav'
import { useT } from '@/i18n/useT'

const APP_NAME = 'tradeEZ'

/** 浏览器标签标题，格式「页面名 - tradeEZ」，随语言切换。 */
export function useDocumentTitle() {
  const { pathname } = useLocation()
  const t = useT()

  useEffect(() => {
    const title = findNavTitle(pathname, t)
    document.title = title ? `${title} - ${APP_NAME}` : APP_NAME
  }, [pathname, t])
}

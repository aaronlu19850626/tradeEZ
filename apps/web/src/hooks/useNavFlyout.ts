import { useCallback, useEffect, useState } from 'react'

/** 浮窗锚点位置，按视口坐标 */
export interface FlyoutPos {
  top: number
  left: number
  width: number
  height: number
}

/**
 * 收缩态菜单的悬停浮窗定位。
 *
 * 用 fixed + 视口坐标而非 absolute：侧栏是 overflow-y-auto 的滚动容器，
 * CSS 规定一轴非 visible 时另一轴也裁剪，absolute 的横向溢出会被整块切掉。
 */
export function useNavFlyout() {
  const [pos, setPos] = useState<FlyoutPos | null>(null)

  const show = useCallback((anchor: HTMLElement) => {
    const r = anchor.getBoundingClientRect()
    setPos({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [])

  const hide = useCallback(() => setPos(null), [])

  // 悬停期间发生滚动或窗口尺寸变化时坐标失效，直接收起，避免留下错位残影
  useEffect(() => {
    if (!pos) return
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [pos, hide])

  return { pos, show, hide }
}

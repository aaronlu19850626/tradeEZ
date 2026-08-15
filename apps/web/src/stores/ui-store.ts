import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * UI 偏好。F-1-04
 *
 * 侧栏有两个正交的维度：
 * - sidebarHidden：左上角汉堡键控制，隐藏的是整条侧栏（不是退化成图标条）
 * - 展开还是仅图标：由当前路由决定，不存状态 —— 首页展开带文字，其他页仅图标
 */
interface UIState {
  sidebarHidden: boolean
  toggleSidebar: () => void
  setSidebarHidden: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarHidden: false,
      toggleSidebar: () => set((s) => ({ sidebarHidden: !s.sidebarHidden })),
      setSidebarHidden: (sidebarHidden) => set({ sidebarHidden }),
    }),
    { name: 'tradeez.ui' },
  ),
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 明暗主题。首次访问跟随系统偏好，之后记住选择。
 * 首屏防闪色由 index.html 里的内联脚本负责，本 store 只负责后续切换。
 */

export type Theme = 'light' | 'dark'

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function detect(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: detect(),
      setTheme: (theme) => {
        apply(theme)
        set({ theme })
      },
    }),
    {
      name: 'tradeez.theme',
      onRehydrateStorage: () => (state) => {
        if (state) apply(state.theme)
      },
    },
  ),
)

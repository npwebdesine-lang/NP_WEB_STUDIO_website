// app/providers.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type ThemeAccent, type ThemeMode, buildThemeKey, THEME_DEFAULTS } from '@/lib/theme'

interface ThemeContextValue {
  mode:      ThemeMode
  accent:    ThemeAccent
  setMode:   (m: ThemeMode) => void
  setAccent: (a: ThemeAccent) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode,   setModeState]   = useState<ThemeMode>(THEME_DEFAULTS.mode)
  const [accent, setAccentState] = useState<ThemeAccent>(THEME_DEFAULTS.accent)

  // Restore from localStorage on mount, before rendering (prevents flash)
  useEffect(() => {
    const saved = localStorage.getItem('np-theme')
    if (saved && saved.includes('-')) {
      const [m, a] = saved.split('-') as [ThemeMode, ThemeAccent]
      setModeState(m)
      setAccentState(a)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setModeState(prefersDark ? 'dark' : 'light')
    }
  }, [])

  // Sync current theme to DOM and localStorage
  useEffect(() => {
    const key = buildThemeKey(mode, accent)
    document.documentElement.setAttribute('data-theme', key)
    localStorage.setItem('np-theme', key)
  }, [mode, accent])

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode: setModeState, setAccent: setAccentState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider')
  return ctx
}


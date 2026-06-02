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

  useEffect(() => {
    const saved = localStorage.getItem('np-theme')
    if (saved) {
      const parts = saved.split('-')
      const m = parts[0] as ThemeMode
      const a = parts.slice(1).join('-') as ThemeAccent
      const validModes:   ThemeMode[]   = ['dark', 'light']
      const validAccents: ThemeAccent[] = ['indigo', 'jade', 'copper']
      if (validModes.includes(m) && validAccents.includes(a)) {
        setModeState(m)
        setAccentState(a)
        return
      }
    }
    // No valid saved value — detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setModeState(prefersDark ? 'dark' : 'light')
  }, [])

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

// components/ui/ThemeSwitcher.tsx
'use client'

import { useTheme } from '@/hooks/useTheme'
import type { ThemeAccent } from '@/lib/theme'

const ACCENTS: { value: ThemeAccent; label: string }[] = [
  { value: 'indigo', label: 'Night Indigo' },
  { value: 'jade',   label: 'Jade Dynasty' },
  { value: 'copper', label: 'Burnished Copper' },
]

export function ThemeSwitcher() {
  const { mode, accent, setMode, setAccent } = useTheme()

  return (
    <aside className="theme-switcher-panel" aria-label="בחירת עיצוב">
      <span className="switcher-label">עיצוב</span>
      <button
        className="mode-toggle-btn"
        aria-label={mode === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      >
        {mode === 'dark' ? '☀️' : '🌙'}
      </button>
      {ACCENTS.map(({ value, label }) => (
        <button
          key={value}
          className={`accent-swatch ${value}${accent === value ? ' active' : ''}`}
          aria-label={label}
          title={label}
          onClick={() => setAccent(value)}
        />
      ))}
    </aside>
  )
}

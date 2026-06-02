// lib/theme.ts
export type ThemeMode   = 'dark' | 'light'
export type ThemeAccent = 'indigo' | 'jade' | 'copper'
export type ThemeKey    = `${ThemeMode}-${ThemeAccent}`

export const THEME_DEFAULTS: { mode: ThemeMode; accent: ThemeAccent } = {
  mode:   'dark',
  accent: 'indigo',
}

export function buildThemeKey(mode: ThemeMode, accent: ThemeAccent): ThemeKey {
  return `${mode}-${accent}`
}

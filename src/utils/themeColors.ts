const tokenMap = {
  breath: { var: '--color-breath', fallback: '#6bbdb4' },
  breathSoft: { var: '--color-breath-soft', fallback: '#8ecec6' },
  pulse: { var: '--color-pulse', fallback: '#d4897c' },
  pulseDeep: { var: '--color-pulse-deep', fallback: '#c07066' },
  dream: { var: '--color-dream', fallback: '#a396c4' },
  gold: { var: '--color-gold', fallback: '#d4bc7a' },
  vellum: { var: '--color-vellum', fallback: '#45423c' },
  ink: { var: '--color-ink', fallback: '#fdfbf8' },
  inkSoft: { var: '--color-ink-soft', fallback: '#ffffff' },
} as const

type ColorToken = keyof typeof tokenMap

export function getThemeColor(token: ColorToken): string {
  const { var: cssVar, fallback } = tokenMap[token]
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return value || fallback
}

export const themeColors = {
  get breath() { return getThemeColor('breath') },
  get breathSoft() { return getThemeColor('breathSoft') },
  get pulse() { return getThemeColor('pulse') },
  get pulseDeep() { return getThemeColor('pulseDeep') },
  get dream() { return getThemeColor('dream') },
  get gold() { return getThemeColor('gold') },
  get vellum() { return getThemeColor('vellum') },
  get ink() { return getThemeColor('ink') },
  get inkSoft() { return getThemeColor('inkSoft') },
}

import { themeColors } from './themeColors'

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getChartTheme() {
  const vellum = themeColors.vellum
  const breath = themeColors.breath

  return {
    grid: hexToRgba(vellum, 0.05),
    tick: hexToRgba(vellum, 0.38),
    cursor: hexToRgba(breath, 0.2),
    tooltip: {
      background: themeColors.inkSoft,
      border: `1px solid ${hexToRgba(breath, 0.2)}`,
      borderRadius: '12px',
      fontFamily: 'JetBrains Mono',
      fontSize: '12px',
      color: vellum,
      boxShadow: `0 4px 20px ${hexToRgba(breath, 0.12)}`,
    },
  }
}

export const chartTheme = getChartTheme()

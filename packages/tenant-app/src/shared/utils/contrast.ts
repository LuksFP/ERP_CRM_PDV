/**
 * Calculate relative luminance of a hex color (WCAG 2.1)
 */
function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return [r ?? 0, g ?? 0, b ?? 0]
}

function linearize(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/**
 * Returns white or dark text for best contrast on a background color.
 * Used for buttons and badges that use the tenant primary color as background.
 */
export function getContrastText(bgHex: string): string {
  const luminance = getRelativeLuminance(bgHex)
  // WCAG threshold ~0.35 gives better aesthetic than pure 0.179
  return luminance > 0.35 ? '#1A1714' : '#FAF8F5'
}

/**
 * Adjust brightness of a hex color by a multiplier (< 1 = darker, > 1 = lighter)
 */
export function adjustBrightness(hex: string, factor: number): string {
  const [r, g, b] = parseHex(hex)
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v * factor)))
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(clamp(r))}${toHex(clamp(g))}${toHex(clamp(b))}`
}

/**
 * Generate a dim version (adds alpha) for backgrounds
 */
export function withAlpha(hex: string, alpha: number): string {
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')
  return `${hex.slice(0, 7)}${alphaHex}`
}

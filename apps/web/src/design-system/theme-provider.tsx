import { useEffect } from 'react'
import { getContrastText, getRelativeLuminance, adjustBrightness, withAlpha } from '@/shared/utils/contrast'
import type { TenantBranding } from '@/shared/types'

/**
 * Injects tenant CSS vars into :root and applies dark/light theme class.
 * Must be rendered inside TenantProvider after config is loaded.
 */
interface Props {
  branding: TenantBranding
  theme?: 'dark' | 'light'
}

export function TenantThemeInjector({ branding, theme = 'dark' }: Props) {
  useEffect(() => {
    const root = document.documentElement
    const isLight = theme === 'light'

    // ── Primary / accent ──────────────────────────────────────────
    const primary = branding.primaryColor
    const accent = branding.accentColor

    // In light mode, bright accents (L > 0.25) are darkened for readable text.
    // Button backgrounds still use the original `primary` via --accent-bg.
    const accentLum = getRelativeLuminance(primary)
    const accentForText = isLight && accentLum > 0.25
      ? adjustBrightness(primary, 0.52)
      : primary

    root.style.setProperty('--accent', accentForText)
    root.style.setProperty('--accent-bg', primary)            // always the brand color
    root.style.setProperty('--accent-dim', withAlpha(accentForText, 0.12))
    root.style.setProperty('--accent-contrast', getContrastText(primary))
    root.style.setProperty('--accent-hover', adjustBrightness(primary, 0.88))
    root.style.setProperty('--accent-active', adjustBrightness(primary, 0.76))

    root.style.setProperty('--accent2', accent)
    root.style.setProperty('--accent2-dim', withAlpha(accent, 0.12))
    root.style.setProperty('--accent2-contrast', getContrastText(accent))

    return () => {
      root.style.removeProperty('--accent')
      root.style.removeProperty('--accent-bg')
      root.style.removeProperty('--accent-dim')
      root.style.removeProperty('--accent-contrast')
      root.style.removeProperty('--accent-hover')
      root.style.removeProperty('--accent-active')
      root.style.removeProperty('--accent2')
      root.style.removeProperty('--accent2-dim')
      root.style.removeProperty('--accent2-contrast')
    }
  }, [branding.primaryColor, branding.accentColor, theme])

  return null
}

import { useEffect } from 'react'
import { getContrastText, adjustBrightness, withAlpha } from '@/shared/utils/contrast'
import type { TenantBranding } from '@/shared/types'

/**
 * Injects tenant CSS vars into :root and applies dark/light theme class.
 * Must be rendered inside TenantProvider after config is loaded.
 */
export function TenantThemeInjector({ branding }: { branding: TenantBranding }) {
  useEffect(() => {
    const root = document.documentElement

    // ── Primary / accent ──────────────────────────────────────────
    const primary = branding.primaryColor
    const accent = branding.accentColor

    root.style.setProperty('--accent', primary)
    root.style.setProperty('--accent-dim', withAlpha(primary, 0.12))
    root.style.setProperty('--accent-contrast', getContrastText(primary))
    root.style.setProperty('--accent-hover', adjustBrightness(primary, 0.88))
    root.style.setProperty('--accent-active', adjustBrightness(primary, 0.76))

    root.style.setProperty('--accent2', accent)
    root.style.setProperty('--accent2-dim', withAlpha(accent, 0.12))
    root.style.setProperty('--accent2-contrast', getContrastText(accent))

    // ── Theme class ───────────────────────────────────────────────
    if (branding.darkMode) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }

    return () => {
      // cleanup when tenant changes / logout
      root.style.removeProperty('--accent')
      root.style.removeProperty('--accent-dim')
      root.style.removeProperty('--accent-contrast')
      root.style.removeProperty('--accent-hover')
      root.style.removeProperty('--accent-active')
      root.style.removeProperty('--accent2')
      root.style.removeProperty('--accent2-dim')
      root.style.removeProperty('--accent2-contrast')
    }
  }, [branding.primaryColor, branding.accentColor, branding.darkMode])

  return null
}

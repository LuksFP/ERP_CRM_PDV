import { useCallback } from 'react'
import { usePDVThemeStore } from '../store/pdvTheme'

function createBeep(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
    osc.onended = () => ctx.close()
  } catch {
    // silently fail if AudioContext not supported
  }
}

export function usePDVSounds() {
  const soundEnabled = usePDVThemeStore((s) => s.theme.soundEnabled)

  const playAdd = useCallback(() => {
    if (!soundEnabled) return
    // short double-beep
    createBeep(880, 0.07, 'square', 0.08)
    setTimeout(() => createBeep(1100, 0.07, 'square', 0.08), 80)
  }, [soundEnabled])

  const playSuccess = useCallback(() => {
    if (!soundEnabled) return
    // ascending arpeggio
    createBeep(523, 0.1, 'sine', 0.12)
    setTimeout(() => createBeep(659, 0.1, 'sine', 0.12), 110)
    setTimeout(() => createBeep(784, 0.18, 'sine', 0.14), 220)
  }, [soundEnabled])

  const playError = useCallback(() => {
    if (!soundEnabled) return
    createBeep(220, 0.2, 'sawtooth', 0.1)
  }, [soundEnabled])

  return { playAdd, playSuccess, playError }
}

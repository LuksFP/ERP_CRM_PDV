import { Delete } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface VirtualNumpadProps {
  value: string
  onChange: (v: string) => void
  hasBackground: boolean
  btnRadius: string
}

const QUICK_VALUES = [10, 20, 50, 100]

export function VirtualNumpad({ value, onChange, hasBackground, btnRadius }: VirtualNumpadProps) {
  const push = (char: string) => {
    if (char === '.' && value.includes('.')) return
    if (value === '0' && char !== '.') {
      onChange(char)
    } else {
      onChange((value + char).slice(0, 10))
    }
  }

  const backspace = () => onChange(value.slice(0, -1) || '0')

  const btnBase = cn(
    'h-9 flex items-center justify-center text-sm font-mono font-semibold rounded transition-all active:scale-95 select-none',
    hasBackground
      ? 'bg-white/8 border border-white/10 text-white hover:bg-white/15'
      : 'bg-surface-1 border border-border text-ink hover:bg-surface-2',
    btnRadius === 'rounded-none' ? 'rounded-none' : btnRadius === 'rounded-full' ? 'rounded-lg' : 'rounded-lg',
  )

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0']

  return (
    <div className="space-y-2">
      {/* Quick preset amounts */}
      <div className="grid grid-cols-4 gap-1">
        {QUICK_VALUES.map((v) => (
          <button
            key={v}
            onClick={() => onChange(String(v))}
            className={cn(
              'h-7 text-[11px] font-mono font-bold rounded transition-all active:scale-95',
              hasBackground ? 'bg-white/6 border border-white/8 text-white/60 hover:bg-white/12 hover:text-white' : 'bg-surface-1 border border-border text-ink-muted hover:bg-surface-2 hover:text-ink',
            )}
          >
            R${v}
          </button>
        ))}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-1">
        {keys.map((k) => (
          <button key={k} onClick={() => push(k)} className={btnBase}>
            {k}
          </button>
        ))}
        {/* Backspace */}
        <button onClick={backspace} className={cn(btnBase, 'text-red-400')}>
          <Delete size={14} />
        </button>
      </div>
    </div>
  )
}

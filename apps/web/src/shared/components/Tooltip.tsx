import { useState, useRef, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current.getBoundingClientRect()

      let top = 0
      let left = 0

      switch (side) {
        case 'top':
          top = trigger.top - tooltip.height - 8
          left = trigger.left + trigger.width / 2 - tooltip.width / 2
          break
        case 'bottom':
          top = trigger.bottom + 8
          left = trigger.left + trigger.width / 2 - tooltip.width / 2
          break
        case 'left':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2
          left = trigger.left - tooltip.width - 8
          break
        case 'right':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2
          left = trigger.right + 8
          break
      }

      setPosition({ top, left })
    }
  }, [visible, side])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className={cn('inline-flex', className)}
      >
        {children}
      </div>

      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-[9999] px-2 py-1 text-xs font-sans text-fg bg-surface-3 border border-[var(--border)] rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{ top: position.top, left: position.left }}
        >
          {content}
        </div>
      )}
    </>
  )
}

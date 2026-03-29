import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span className="absolute left-3 text-ink-subtle pointer-events-none">{iconLeft}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 bg-surface-1 border border-border rounded text-sm text-ink placeholder:text-ink-subtle',
              'px-3 transition-shadow duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              iconLeft && 'pl-9',
              iconRight && 'pr-9',
              error && 'border-red-500 focus:ring-red-400/40',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-ink-subtle">{iconRight}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-subtle">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-surface-1 border border-border rounded text-sm text-ink placeholder:text-ink-subtle',
            'px-3 py-2 transition-shadow duration-150 resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]',
            'disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-subtle">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-9 bg-surface-1 border border-border rounded text-sm text-ink',
            'px-3 transition-shadow duration-150 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]',
            'disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-subtle">{hint}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

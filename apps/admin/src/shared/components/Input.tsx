import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconRight,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-fg-muted uppercase tracking-wide"
          >
            {label}
            {props.required && (
              <span className="text-red ml-0.5">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-fg-dim pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-9 w-full rounded-input bg-surface-2 border border-[var(--border)]',
              'text-sm text-fg placeholder:text-fg-dim',
              'px-3 font-sans',
              'outline-none transition-colors duration-100',
              'hover:border-[var(--border-hover)]',
              'focus:border-accent focus:ring-1 focus:ring-accent',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              icon && 'pl-9',
              iconRight && 'pr-9',
              error && 'border-red/50 focus:border-red focus:ring-red',
              className
            )}
            {...props}
          />

          {iconRight && (
            <div className="absolute right-3 text-fg-dim pointer-events-none">
              {iconRight}
            </div>
          )}
        </div>

        {(error ?? hint) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-red' : 'text-fg-dim'
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

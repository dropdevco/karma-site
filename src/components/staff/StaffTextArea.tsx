import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface StaffTextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'onBlur' | 'id'> {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
}

export const StaffTextArea = forwardRef<HTMLTextAreaElement, StaffTextAreaProps>(
  function StaffTextArea(
    { id, label, hint, error, required, value, onChange, onBlur, className, rows = 4, ...textareaProps },
    ref,
  ) {
    const hintId = hint ? `${id}-hint` : undefined
    const errorId = error ? `${id}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="font-display text-sm font-semibold text-karma-ink">
          {label}
          {required && (
            <span className="text-karma-red" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        {hint && (
          <p id={hintId} className="text-sm text-karma-ink-soft">
            {hint}
          </p>
        )}
        <textarea
          {...textareaProps}
          ref={ref}
          id={id}
          rows={rows}
          value={value}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={cn(
            'rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink placeholder:text-karma-ink-soft/60 focus:border-karma-red focus:outline-none',
            error && 'border-karma-red',
            className,
          )}
        />
        {error && (
          <p id={errorId} className="text-sm font-medium text-karma-red">
            {error}
          </p>
        )}
      </div>
    )
  },
)

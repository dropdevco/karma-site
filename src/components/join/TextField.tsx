import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur' | 'id'> {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, hint, error, required, value, onChange, onBlur, className, ...inputProps },
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
      <input
        {...inputProps}
        ref={ref}
        id={id}
        value={value}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={cn(
          'min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink placeholder:text-karma-ink-soft/60 focus:border-karma-red',
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
})

import { cn } from '@/lib/cn'
import type { FieldOption } from './formTypes'

interface RadioGroupFieldProps<T extends string> {
  name: string
  legend: string
  hint?: string
  required?: boolean
  options: FieldOption<T>[]
  value: T | ''
  error?: string
  onChange: (value: T) => void
  onBlur: () => void
  firstOptionRef?: (el: HTMLInputElement | null) => void
}

export function RadioGroupField<T extends string>({
  name,
  legend,
  hint,
  required,
  options,
  value,
  error,
  onChange,
  onBlur,
  firstOptionRef,
}: RadioGroupFieldProps<T>) {
  const hintId = hint ? `${name}-hint` : undefined
  const errorId = error ? `${name}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="font-display text-sm font-semibold text-karma-ink">
        {legend}
        {required && (
          <span className="text-karma-red" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </legend>
      {hint && (
        <p id={hintId} className="text-sm text-karma-ink-soft">
          {hint}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {options.map((option, index) => {
          const id = `${name}-${option.value}`
          const checked = value === option.value
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                'flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors',
                checked
                  ? 'border-karma-red bg-karma-red-soft text-karma-red-dark'
                  : 'border-karma-tan-dark/40 bg-white text-karma-ink hover:border-karma-red/50',
              )}
            >
              <input
                ref={index === 0 ? firstOptionRef : undefined}
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={checked}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
                className="h-4 w-4 accent-karma-red"
              />
              {option.label}
            </label>
          )
        })}
      </div>
      {error && (
        <p id={errorId} className="text-sm font-medium text-karma-red">
          {error}
        </p>
      )}
    </fieldset>
  )
}

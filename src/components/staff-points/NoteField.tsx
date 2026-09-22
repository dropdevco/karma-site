import { cn } from '@/lib/cn'

interface NoteFieldProps {
  id: string
  label: string
  hint?: string
  placeholder?: string
  error?: string
  value: string
  onChange: (value: string) => void
}

export function NoteField({ id, label, hint, placeholder, error, value, onChange }: NoteFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-display text-sm font-semibold text-karma-ink">
        {label}
        <span className="text-karma-red" aria-hidden="true">
          {' '}
          *
        </span>
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-karma-ink-soft">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        rows={4}
        required
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink placeholder:text-karma-ink-soft/60 focus:border-karma-red focus:outline-none',
          error && 'border-karma-red',
        )}
      />
      {error && (
        <p id={errorId} className="text-sm font-medium text-karma-red">
          {error}
        </p>
      )}
    </div>
  )
}

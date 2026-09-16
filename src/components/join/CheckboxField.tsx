interface CheckboxFieldProps {
  id: string
  label: string
  description?: string
  checked: boolean
  required?: boolean
  error?: string
  onChange: (checked: boolean) => void
  onBlur?: () => void
  inputRef?: (el: HTMLInputElement | null) => void
}

export function CheckboxField({
  id,
  label,
  description,
  checked,
  required,
  error,
  onChange,
  onBlur,
  inputRef,
}: CheckboxFieldProps) {
  const descId = description ? `${id}-desc` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          checked={checked}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.checked)}
          onBlur={onBlur}
          className="mt-0.5 h-5 w-5 shrink-0 accent-karma-red"
        />
        <label htmlFor={id} className="text-sm font-medium text-karma-ink">
          {label}
          {required && (
            <span className="text-karma-red" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      </div>
      {description && (
        <p id={descId} className="pl-8 text-sm text-karma-ink-soft">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="pl-8 text-sm font-medium text-karma-red">
          {error}
        </p>
      )}
    </div>
  )
}

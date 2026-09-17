interface StaffSelectOption {
  value: string
  label: string
}

interface StaffSelectFieldProps {
  id: string
  label: string
  placeholder: string
  value: string
  options: StaffSelectOption[]
  required?: boolean
  error?: string
  onChange: (value: string) => void
  onBlur?: () => void
  selectRef?: (el: HTMLSelectElement | null) => void
}

export function StaffSelectField({
  id,
  label,
  placeholder,
  value,
  options,
  required,
  error,
  onChange,
  onBlur,
  selectRef,
}: StaffSelectFieldProps) {
  const errorId = error ? `${id}-error` : undefined

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
      <select
        ref={selectRef}
        id={id}
        value={value}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink focus:border-karma-red focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-sm font-medium text-karma-red">
          {error}
        </p>
      )}
    </div>
  )
}

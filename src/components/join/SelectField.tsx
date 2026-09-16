interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  placeholder: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function SelectField({ id, label, placeholder, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-display text-sm font-semibold text-karma-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink focus:border-karma-red"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

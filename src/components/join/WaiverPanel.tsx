import { CheckboxField } from './CheckboxField'

interface WaiverPanelProps {
  legend: string
  paragraphs: string[]
  checkboxLabel: string
  checked: boolean
  error?: string
  onChange: (checked: boolean) => void
  onBlur: () => void
  inputRef?: (el: HTMLInputElement | null) => void
}

export function WaiverPanel({
  legend,
  paragraphs,
  checkboxLabel,
  checked,
  error,
  onChange,
  onBlur,
  inputRef,
}: WaiverPanelProps) {
  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="font-display text-sm font-semibold text-karma-ink">{legend}</legend>
      {/*
        Placeholder waiver copy (src/locales/{en,es}/join.json, form.fields.waiver.body1-4).
        This is invented, non-final legal language written to unblock the UI build.
        It MUST be reviewed and approved by Karma's own attorney before Release 1
        ships publicly — do not treat this text as production-ready liability language.
      */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-karma-tan-dark/40 bg-karma-tan-light/50 p-4 text-sm leading-relaxed text-karma-ink-soft">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={index > 0 ? 'mt-3' : undefined}>
            {paragraph}
          </p>
        ))}
      </div>
      <CheckboxField
        id="waiverAccepted"
        label={checkboxLabel}
        checked={checked}
        required
        error={error}
        onChange={onChange}
        onBlur={onBlur}
        inputRef={inputRef}
      />
    </fieldset>
  )
}

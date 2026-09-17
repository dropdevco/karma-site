import type { ReactNode } from 'react'

interface BilingualPairProps {
  legend: string
  hint?: string
  children: ReactNode
}

/** Groups an English/Spanish field pair under one heading so the form reads as organised sections rather than a wall of identical boxes. */
export function BilingualPair({ legend, hint, children }: BilingualPairProps) {
  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-0 font-display text-base font-bold text-karma-ink">{legend}</legend>
      {hint && <p className="-mt-2 text-sm text-karma-ink-soft">{hint}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

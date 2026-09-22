import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

export type AwardDirection = 'give' | 'deduct'

interface PointsAmountFieldProps {
  id: string
  direction: AwardDirection
  onDirectionChange: (direction: AwardDirection) => void
  amount: string
  onAmountChange: (amount: string) => void
  error?: string
}

export function PointsAmountField({
  id,
  direction,
  onDirectionChange,
  amount,
  onAmountChange,
  error,
}: PointsAmountFieldProps) {
  const { t } = useTranslation('staffPoints')
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-sm font-semibold text-karma-ink">
        {t('points.label')}
        <span className="text-karma-red" aria-hidden="true">
          {' '}
          *
        </span>
      </span>

      <div className="flex gap-2" role="radiogroup" aria-label={t('points.directionLabel')}>
        <button
          type="button"
          role="radio"
          aria-checked={direction === 'give'}
          onClick={() => onDirectionChange('give')}
          className={cn(
            'min-h-11 flex-1 rounded-xl border-2 px-4 py-2.5 font-display text-base font-bold transition-colors',
            direction === 'give'
              ? 'border-karma-red bg-karma-red text-white'
              : 'border-karma-tan-dark/40 bg-white text-karma-ink-soft',
          )}
        >
          {t('points.give')}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={direction === 'deduct'}
          onClick={() => onDirectionChange('deduct')}
          className={cn(
            'min-h-11 flex-1 rounded-xl border-2 px-4 py-2.5 font-display text-base font-bold transition-colors',
            direction === 'deduct'
              ? 'border-karma-red bg-white text-karma-red'
              : 'border-karma-tan-dark/40 bg-white text-karma-ink-soft',
          )}
        >
          {t('points.deduct')}
        </button>
      </div>

      <label htmlFor={id} className="sr-only">
        {t('points.amountLabel')}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 left-4 flex items-center font-display text-lg font-bold',
            direction === 'deduct' ? 'text-karma-red' : 'text-karma-ink-soft',
          )}
        >
          {direction === 'deduct' ? '−' : '+'}
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={amount}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={(event) => {
            const digitsOnly = event.target.value.replace(/[^0-9]/g, '')
            onAmountChange(digitsOnly)
          }}
          placeholder={t('points.amountPlaceholder')}
          className={cn(
            'min-h-11 w-full rounded-xl border border-karma-tan-dark/40 bg-white py-2.5 pl-10 pr-4 text-base text-karma-ink placeholder:text-karma-ink-soft/60 focus:border-karma-red focus:outline-none',
            error && 'border-karma-red',
          )}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm font-medium text-karma-red">
          {error}
        </p>
      )}
    </div>
  )
}

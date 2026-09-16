import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { getCapacityState, getSpotsLeft, type CapacityState } from './capacity'

const STYLES: Record<CapacityState, string> = {
  open: 'bg-karma-tan-light text-karma-ink-soft',
  nearlyFull: 'bg-karma-red-soft text-karma-red-dark',
  full: 'bg-karma-ink text-white',
}

interface CapacityBadgeProps {
  spotsTaken: number
  capacity: number
  className?: string
}

export function CapacityBadge({ spotsTaken, capacity, className }: CapacityBadgeProps) {
  const { t } = useTranslation('events')
  const state = getCapacityState(spotsTaken, capacity)
  const left = getSpotsLeft(spotsTaken, capacity)

  const label =
    state === 'full'
      ? t('capacity.full')
      : state === 'nearlyFull'
        ? t('capacity.nearlyFull')
        : t('capacity.spotsLeft', { count: left })

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
        STYLES[state],
        className,
      )}
    >
      {label}
    </span>
  )
}

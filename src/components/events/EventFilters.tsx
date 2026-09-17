import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import type { EventCategory } from '@/lib/eventsApi'
import { CATEGORY_ORDER } from './categoryMeta'

export type WhenFilter = 'upcoming' | 'past'

const WHEN_OPTIONS: readonly WhenFilter[] = ['upcoming', 'past']

const pillBase =
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors'

interface EventFiltersProps {
  category: EventCategory | 'all'
  when: WhenFilter
  onCategoryChange: (category: EventCategory | 'all') => void
  onWhenChange: (when: WhenFilter) => void
}

export function EventFilters({ category, when, onCategoryChange, onWhenChange }: EventFiltersProps) {
  const { t } = useTranslation('events')

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label={t('filters.whenLabel')}
        className="inline-flex w-fit rounded-full border border-karma-tan-dark/40 bg-white p-1"
      >
        {WHEN_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={when === option}
            onClick={() => onWhenChange(option)}
            className={cn(pillBase, when === option ? 'bg-karma-red text-white' : 'text-karma-ink-soft hover:text-karma-ink')}
          >
            {t(`filters.${option}`)}
          </button>
        ))}
      </div>

      <div role="group" aria-label={t('filters.categoryLabel')} className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={category === 'all'}
          onClick={() => onCategoryChange('all')}
          className={cn(
            pillBase,
            'border',
            category === 'all'
              ? 'border-karma-red bg-karma-red-soft text-karma-red-dark'
              : 'border-karma-tan-dark/40 text-karma-ink-soft hover:text-karma-ink',
          )}
        >
          {t('filters.allCategories')}
        </button>
        {CATEGORY_ORDER.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={category === option}
            onClick={() => onCategoryChange(option)}
            className={cn(
              pillBase,
              'border',
              category === option
                ? 'border-karma-red bg-karma-red-soft text-karma-red-dark'
                : 'border-karma-tan-dark/40 text-karma-ink-soft hover:text-karma-ink',
            )}
          >
            {t(`categories.${option}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

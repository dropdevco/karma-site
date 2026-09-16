import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

export function DraftBanner() {
  const { t } = useTranslation('legal')
  const draftLabel = t('draftBanner.label')
  const draftMessage = t('draftBanner.message')

  return (
    <div className={cn('sticky top-0 z-40 border-b-2 px-4 py-3 sm:px-6 md:py-4', 'bg-karma-red-soft border-karma-red')}>
      <div className="mx-auto max-w-6xl">
        <p className="font-display text-sm font-bold text-karma-red">
          {draftLabel}
        </p>
        <p className="mt-1 text-sm text-karma-ink">
          {draftMessage}
        </p>
      </div>
    </div>
  )
}

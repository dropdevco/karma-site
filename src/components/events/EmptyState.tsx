import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  onReset: () => void
}

export function EmptyState({ onReset }: EmptyStateProps) {
  const { t } = useTranslation('events')

  return (
    <div className="rounded-card border border-dashed border-karma-tan-dark/50 bg-white/50 px-6 py-16 text-center">
      <p className="font-display text-2xl font-bold text-karma-ink">{t('empty.title')}</p>
      <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{t('empty.body')}</p>
      <Button type="button" variant="secondary" className="mt-6" onClick={onReset}>
        {t('empty.reset')}
      </Button>
    </div>
  )
}

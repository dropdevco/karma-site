import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { downloadEventIcs } from './ics'
import type { KarmaEvent } from '@/data/events'
import type { LanguageCode } from '@/i18n'

interface AddToCalendarButtonProps {
  event: KarmaEvent
  lang: LanguageCode
}

export function AddToCalendarButton({ event, lang }: AddToCalendarButtonProps) {
  const { t } = useTranslation('events')

  return (
    <Button type="button" variant="secondary" onClick={() => downloadEventIcs(event, lang)}>
      {t('detail.addToCalendar')}
    </Button>
  )
}

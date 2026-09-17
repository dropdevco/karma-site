import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EventRosterRow } from '@/lib/database.types'
import { Button } from '@/components/ui/Button'

interface ManualCheckInListProps {
  roster: EventRosterRow[]
  checkedInUserIds: Set<string>
  onCheckIn: (member: EventRosterRow) => void
}

/** Fallback for a member whose phone is dead: staff find them by name and check them in by hand. */
export function ManualCheckInList({ roster, checkedInUserIds, onCheckIn }: ManualCheckInListProps) {
  const { t } = useTranslation('scanner')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...roster].sort((a, b) => a.full_name.localeCompare(b.full_name))
    if (!q) return sorted
    return sorted.filter((m) => m.full_name.toLowerCase().includes(q))
  }, [roster, query])

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('manual.searchPlaceholder')}
        className="w-full rounded-full border-2 border-karma-tan-dark/40 bg-white px-5 py-3 text-lg text-karma-ink placeholder:text-karma-ink-soft focus:border-karma-red"
        aria-label={t('manual.searchPlaceholder')}
      />

      {filtered.length === 0 && (
        <p className="py-6 text-center text-karma-ink-soft">{t('manual.noResults')}</p>
      )}

      <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
        {filtered.map((member) => {
          const already = checkedInUserIds.has(member.user_id)
          return (
            <li
              key={member.user_id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-karma-tan-dark/30 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold text-karma-ink">{member.full_name}</p>
                <p className="text-sm text-karma-ink-soft">
                  {t(`result.registrationStatus.${member.registration_status ?? 'unregistered'}`)}
                </p>
              </div>
              <Button
                size="sm"
                variant={already ? 'secondary' : 'primary'}
                disabled={already}
                onClick={() => onCheckIn(member)}
                className="shrink-0"
              >
                {already ? t('manual.alreadyIn') : t('manual.checkInCta')}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

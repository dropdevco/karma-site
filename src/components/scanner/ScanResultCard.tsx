import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import type { ScanOutcome } from './types'

const STYLES: Record<ScanOutcome['kind'], string> = {
  accepted: 'border-green-700 bg-green-50',
  already: 'border-amber-600 bg-amber-50',
  stale: 'border-orange-600 bg-orange-50',
  invalid: 'border-karma-red bg-karma-red-soft',
  unknown: 'border-karma-red bg-karma-red-soft',
}

/**
 * The single most likely fraud at check-in is someone presenting a friend's
 * code, so whenever a code verifies, the member's name is the biggest thing
 * on screen — staff need to see whose code it is, not just that "a" code worked.
 */
export function ScanResultCard({ outcome }: { outcome: ScanOutcome }) {
  const { t } = useTranslation('scanner')
  const member = outcome.member

  return (
    <div className={cn('rounded-card border-4 p-6 shadow-sm', STYLES[outcome.kind])}>
      <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-karma-ink-soft">
        {t(`result.${outcome.kind}.label`)}
      </p>

      {member ? (
        <>
          <p className="mt-2 font-display text-4xl font-extrabold leading-tight text-karma-ink">
            {member.full_name}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {member.registration_status && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-karma-ink">
                {t(`result.registrationStatus.${member.registration_status}`)}
              </span>
            )}
            {!member.registration_status && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-karma-ink">
                {t('result.registrationStatus.unregistered')}
              </span>
            )}
            {outcome.categoryLabels?.map((label) => (
              <span
                key={label}
                className="rounded-full bg-karma-red px-3 py-1 text-sm font-semibold text-white"
              >
                {label}
              </span>
            ))}
          </div>
          {member.emergency_contact_name && (
            <div className="mt-4 rounded-xl bg-white/60 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-karma-ink-soft">
                {t('result.emergencyContact')}
              </p>
              <p className="mt-1 text-base font-semibold text-karma-ink">
                {member.emergency_contact_name}
                {member.emergency_contact_phone ? ` — ${member.emergency_contact_phone}` : ''}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-2 font-display text-2xl font-bold text-karma-ink">{t(`result.${outcome.kind}.body`)}</p>
      )}
    </div>
  )
}

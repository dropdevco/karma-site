import { useTranslation } from 'react-i18next'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ErrorState } from './ErrorState'
import type { KarmaEvent, EventApiErrorCode } from '@/lib/eventsApi'
import type { RegistrationRow } from '@/lib/database.types'

export type RegistrationLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface RegistrationPanelProps {
  event: KarmaEvent
  authLoading: boolean
  isSignedIn: boolean
  readyToRegister: boolean
  registration: RegistrationRow | null
  regStatus: RegistrationLoadStatus
  actionPending: boolean
  actionError: EventApiErrorCode | null
  onRegister: () => void
  onCancel: () => void
  onRetryRegistration: () => void
  returnTo: string
}

export function RegistrationPanel({
  event,
  authLoading,
  isSignedIn,
  readyToRegister,
  registration,
  regStatus,
  actionPending,
  actionError,
  onRegister,
  onCancel,
  onRetryRegistration,
  returnTo,
}: RegistrationPanelProps) {
  const { t } = useTranslation('events')

  const cancelledEvent = event.status === 'cancelled'
  const ended = new Date(event.endsAt).getTime() <= Date.now()
  const activeStatus = registration && registration.status !== 'cancelled' ? registration.status : null
  const full = event.spotsTaken >= event.capacity

  return (
    <div className="mt-10 rounded-card border-2 border-karma-red/20 bg-white p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold text-karma-ink">{t('register.heading')}</h2>

      {cancelledEvent ? (
        <>
          <p className="mt-2 font-semibold text-karma-ink">{t('register.cancelledEvent.title')}</p>
          <p className="mt-1 max-w-xl text-karma-ink-soft">{t('register.cancelledEvent.body')}</p>
        </>
      ) : ended ? (
        <>
          <p className="mt-2 font-semibold text-karma-ink">{t('register.ended.title')}</p>
          <p className="mt-1 max-w-xl text-karma-ink-soft">{t('register.ended.body')}</p>
        </>
      ) : authLoading ? (
        <p className="mt-2 text-karma-ink-soft" aria-busy="true">
          {t('register.loading')}
        </p>
      ) : !isSignedIn ? (
        <>
          <p className="mt-2 max-w-xl text-karma-ink-soft">{t('register.signedOut.body')}</p>
          <ButtonLink to="/signin" state={{ returnTo }} className="mt-4">
            {t('register.signedOut.cta')}
          </ButtonLink>
        </>
      ) : !readyToRegister ? (
        <>
          <p className="mt-2 font-semibold text-karma-ink">{t('register.incomplete.title')}</p>
          <p className="mt-1 max-w-xl text-karma-ink-soft">{t('register.incomplete.body')}</p>
          <ButtonLink to="/join" className="mt-4">
            {t('register.incomplete.cta')}
          </ButtonLink>
        </>
      ) : regStatus === 'loading' || regStatus === 'idle' ? (
        <p className="mt-2 text-karma-ink-soft" aria-busy="true">
          {t('register.loading')}
        </p>
      ) : regStatus === 'error' ? (
        <div className="mt-4">
          <ErrorState
            title={t('register.loadError.title')}
            body={t('register.loadError.body')}
            retryLabel={t('register.loadError.retry')}
            onRetry={onRetryRegistration}
          />
        </div>
      ) : activeStatus === 'registered' ? (
        <>
          <p className="mt-2 font-semibold text-karma-ink">{t('register.registered.title')}</p>
          <p className="mt-1 max-w-xl text-karma-ink-soft">{t('register.registered.body')}</p>
          <Button type="button" variant="secondary" className="mt-4" onClick={onCancel} disabled={actionPending}>
            {actionPending ? t('register.processing') : t('register.registered.cancelCta')}
          </Button>
        </>
      ) : activeStatus === 'waitlisted' ? (
        <>
          <p className="mt-2 font-semibold text-karma-ink">{t('register.waitlisted.title')}</p>
          <p className="mt-1 max-w-xl text-karma-ink-soft">{t('register.waitlisted.body')}</p>
          <Button type="button" variant="secondary" className="mt-4" onClick={onCancel} disabled={actionPending}>
            {actionPending ? t('register.processing') : t('register.waitlisted.leaveCta')}
          </Button>
        </>
      ) : full ? (
        <>
          <p className="mt-2 text-sm text-karma-ink-soft">{t('register.full.count', { count: event.waitlistCount })}</p>
          <Button type="button" className="mt-4" onClick={onRegister} disabled={actionPending}>
            {actionPending ? t('register.processing') : t('register.full.cta')}
          </Button>
        </>
      ) : (
        <Button type="button" className="mt-4" onClick={onRegister} disabled={actionPending}>
          {actionPending ? t('register.processing') : t('register.available.cta')}
        </Button>
      )}

      {actionError && (
        <p role="alert" className="mt-3 text-sm font-semibold text-karma-red-dark">
          {t(`register.errors.${actionError}`)}
        </p>
      )}
    </div>
  )
}

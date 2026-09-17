import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cacheWaiverVersion, enqueueWalkIn, getCachedWaiverVersion } from '@/lib/offlineQueue'
import { supabase } from '@/lib/supabase'
import { useSyncQueue } from '@/lib/scannerSync'
import { Container, Section } from '@/components/ui/Section'
import { SyncStatusBar } from '@/components/scanner/SyncStatusBar'
import { WalkInForm, type WalkInFormValues } from '@/components/scanner/WalkInForm'

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  return online
}

export function StaffWalkIn() {
  const { id: eventId } = useParams<{ id: string }>()
  const { t } = useTranslation('scanner')
  const online = useOnlineStatus()
  const sync = useSyncQueue(eventId ?? '')

  const [waiverVersion, setWaiverVersion] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getCachedWaiverVersion().then((cached) => {
      if (cached && !cancelled) setWaiverVersion(cached)
    })
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      void supabase.rpc('current_waiver_version').then(({ data }) => {
        if (cancelled || !data) return
        setWaiverVersion(data)
        void cacheWaiverVersion(data)
      })
    }
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = useCallback(
    async (values: WalkInFormValues) => {
      if (!eventId || !waiverVersion) return
      setSubmitting(true)
      try {
        await enqueueWalkIn({
          id: crypto.randomUUID(),
          eventId,
          fullName: values.fullName.trim(),
          email: values.email.trim() || undefined,
          phone: values.phone.trim() || undefined,
          emergencyContactName: values.emergencyContactName.trim() || undefined,
          emergencyContactPhone: values.emergencyContactPhone.trim() || undefined,
          confirmedAdult: values.confirmedAdult,
          waiverAcknowledged: values.waiverAcknowledged,
          waiverVersion,
          recordedAt: new Date().toISOString(),
        })
        void sync.syncNow()
      } finally {
        setSubmitting(false)
      }
    },
    [eventId, waiverVersion, sync],
  )

  if (!eventId) return null

  return (
    <Section className="py-8 sm:py-10">
      <Container className="max-w-xl">
        <h1 className="font-display text-2xl font-extrabold text-karma-ink">{t('walkIn.title')}</h1>
        <p className="mt-1 text-karma-ink-soft">{t('walkIn.subtitle')}</p>

        <div className="mt-5">
          <SyncStatusBar
            online={online}
            pendingCount={sync.pendingCount}
            syncing={sync.syncing}
            lastSyncFailed={sync.lastSyncFailed}
            rejectedScans={sync.rejectedScans}
            rejectedWalkIns={sync.rejectedWalkIns}
            onSyncNow={() => void sync.syncNow()}
            onDismissScan={(id) => void sync.dismissRejectedScan(id)}
            onDismissWalkIn={(id) => void sync.dismissRejectedWalkIn(id)}
          />
        </div>

        {!waiverVersion && (
          <p className="mt-5 rounded-card border-2 border-karma-red bg-karma-red-soft p-4 font-semibold text-karma-ink">
            {t('walkIn.errors.noWaiverVersion')}
          </p>
        )}

        <div className="mt-5 rounded-card border-2 border-karma-tan-dark/30 bg-white p-5">
          <WalkInForm waiverVersion={waiverVersion} submitting={submitting} onSubmit={handleSubmit} />
        </div>
      </Container>
    </Section>
  )
}

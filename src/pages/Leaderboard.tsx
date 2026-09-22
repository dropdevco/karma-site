import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { useAuth } from '@/auth/useAuth'
import { Podium } from '@/components/leaderboard/Podium'
import { RankedList } from '@/components/leaderboard/RankedList'
import { MyStandingCard } from '@/components/leaderboard/MyStandingCard'
import { PrizeBanner } from '@/components/leaderboard/PrizeBanner'
import { HowItWorks } from '@/components/leaderboard/HowItWorks'
import {
  fetchLeaderboardData,
  type LeaderboardData,
  type LeaderboardErrorCode,
} from '@/components/leaderboard/leaderboardApi'

type Status = 'loading' | 'ready' | 'error'

export function Leaderboard() {
  const { t } = useTranslation('leaderboard')
  const { user } = useAuth()

  const [status, setStatus] = useState<Status>('loading')
  const [errorCode, setErrorCode] = useState<LeaderboardErrorCode | null>(null)
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [liveMessage, setLiveMessage] = useState('')
  const hasLoadedOnce = useRef(false)

  const load = useCallback(() => {
    setStatus('loading')
    setErrorCode(null)
    void fetchLeaderboardData().then((result) => {
      if (result.ok) {
        setData(result.data)
        setStatus('ready')
        if (hasLoadedOnce.current) setLiveMessage(t('live.updated'))
        hasLoadedOnce.current = true
      } else {
        setErrorCode(result.code)
        setStatus('error')
      }
    })
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const rows = data?.rows ?? []
  const podiumRows = rows.filter((row) => row.rank <= 3)
  const restRows = rows.filter((row) => row.rank > 3)
  const currentUserId = user?.id ?? null
  const isInList = currentUserId !== null && rows.some((row) => row.user_id === currentUserId)

  return (
    <Section className="pt-12 sm:pt-16">
      <Container className="max-w-3xl">
        <div role="status" aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-bold text-karma-ink sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 max-w-xl text-karma-ink-soft">{t('subtitle')}</p>

        <div className="mt-8">
          <PrizeBanner />
        </div>

        {status === 'loading' && (
          <p className="mt-8 text-karma-ink-soft" aria-busy="true">
            {t('loading')}
          </p>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="mt-8 rounded-card border border-dashed border-karma-red/40 bg-karma-red-soft/30 px-6 py-16 text-center"
          >
            <p className="font-display text-2xl font-bold text-karma-ink">
              {errorCode === 'offline' ? t('error.offlineTitle') : t('error.title')}
            </p>
            <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">
              {errorCode === 'offline' ? t('error.offlineBody') : t('error.body')}
            </p>
            <Button type="button" variant="secondary" className="mt-6" onClick={load}>
              {t('error.retry')}
            </Button>
          </div>
        )}

        {status === 'ready' && (
          <>
            {data?.mySummary && !isInList && (
              <div className="mt-8">
                <MyStandingCard summary={data.mySummary} />
              </div>
            )}

            {rows.length === 0 ? (
              <div className="mt-8 rounded-card border border-dashed border-karma-tan-dark/50 bg-white/50 px-6 py-16 text-center">
                <p className="font-display text-2xl font-bold text-karma-ink">{t('empty.title')}</p>
                <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{t('empty.body')}</p>
                <ButtonLink to="/events" className="mt-6">
                  {t('empty.cta')}
                </ButtonLink>
              </div>
            ) : (
              <div className="mt-10">
                <Podium rows={podiumRows} currentUserId={currentUserId} />
                <RankedList rows={restRows} currentUserId={currentUserId} />
              </div>
            )}

            <div className="mt-10">
              <HowItWorks />
            </div>

            <div className="mt-10 flex flex-col items-start gap-3 border-t border-karma-tan-dark/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-karma-ink-soft">{t('cta.body')}</p>
              <ButtonLink to="/events" variant="secondary" size="md">
                {t('cta.button')}
              </ButtonLink>
            </div>
          </>
        )}
      </Container>
    </Section>
  )
}

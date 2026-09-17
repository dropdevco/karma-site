import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { useAuth } from '@/auth/useAuth'
import { supabase, isOffline } from '@/lib/supabase'
import { createQrToken } from '@/lib/qrToken'
import type { MemberQrSecretRow } from '@/lib/database.types'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Section, Container } from '@/components/ui/Section'

const CACHE_KEY_PREFIX = 'karma-qr-secret:'
const REFRESH_INTERVAL_MS = 15000

export function AccountQr() {
  const { t } = useTranslation('qr')
  const { user, profile, status, loading } = useAuth()

  const [secret, setSecret] = useState<string | null>(null)
  const [secretLoading, setSecretLoading] = useState(true)
  const [secretError, setSecretError] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [cycle, setCycle] = useState(0)
  const [resetting, setResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const secretCacheKeyRef = useRef<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load secret from cache or network
  useEffect(() => {
    if (!user?.id) return

    const cacheKey = `${CACHE_KEY_PREFIX}${user.id}`
    const userId = user.id
    secretCacheKeyRef.current = cacheKey

    let cachedSecret: string | null = null
    try {
      const raw = localStorage.getItem(cacheKey)
      if (raw) cachedSecret = raw
    } catch {
      /* private mode: best effort */
    }

    if (cachedSecret) {
      setSecret(cachedSecret)
      setSecretLoading(false)
      void fetchSecretFromNetwork()
    } else {
      void fetchSecretFromNetwork()
    }

    async function fetchSecretFromNetwork() {
      try {
        const res = await supabase
          .from('member_qr_secrets')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        const data = res.data as MemberQrSecretRow | null
        if (data) {
          const nextSecret = data.secret
          setSecret(nextSecret)
          setSecretError(null)

          try {
            localStorage.setItem(cacheKey, nextSecret)
          } catch {
            /* best effort */
          }
        } else if (!res.error) {
          setSecretError('no_secret')
        }
      } catch (err) {
        if (!cachedSecret) {
          if (isOffline(err)) {
            setSecretError('offline_no_cache')
          } else {
            setSecretError('fetch_failed')
          }
        }
      } finally {
        setSecretLoading(false)
      }
    }
  }, [user?.id])

  // Generate and update QR code
  useEffect(() => {
    if (!secret) return
    if (!user?.id) return

    let cancelled = false
    const userId = user.id
    const secretValue = secret

    async function generateQr() {
      try {
        const token = await createQrToken(secretValue, userId)
        if (!cancelled) {
          const url = await QRCode.toDataURL(token, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          })
          setQrDataUrl(url)
          setCycle((c) => c + 1)
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err)
      }
    }

    void generateQr()

    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    refreshTimerRef.current = setInterval(generateQr, REFRESH_INTERVAL_MS)


    return () => {
      cancelled = true
    }
  }, [secret, user?.id])

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  }, [])

  const handleResetCode = async () => {
    if (!window.confirm(t('reset.confirm'))) return

    setResetting(true)
    try {
      await supabase.rpc('rotate_my_qr_secret')

      if (secretCacheKeyRef.current) {
        try {
          localStorage.removeItem(secretCacheKeyRef.current)
        } catch {
          /* ignore */
        }
      }

      setSecret(null)
      setQrDataUrl(null)
      setResetSuccess(true)
      setTimeout(() => setResetSuccess(false), 3000)

      if (user?.id) {
        const res = await supabase
          .from('member_qr_secrets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        const data = res.data as MemberQrSecretRow | null
        if (data) {
          const nextSecret = data.secret
          setSecret(nextSecret)
          try {
            localStorage.setItem(secretCacheKeyRef.current!, nextSecret)
          } catch {
            /* best effort */
          }
        }
      }
    } catch (err) {
      console.error('Failed to reset code:', err)
      setSecretError('reset_failed')
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <div className="min-h-[60vh]" aria-hidden="true" />
        </Container>
      </Section>
    )
  }

  const needsCompletion =
    status?.profile_complete === false || status?.waiver_current === false

  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-bold text-karma-ink sm:text-4xl">{t('heading')}</h1>

        {needsCompletion && (
          <div className="mt-6 rounded-card border border-karma-tan-dark/30 bg-karma-tan-light p-4">
            <p className="text-sm text-karma-ink">{t('incompleteProfile.message')}</p>
            <ButtonLink
              to="/join"
              variant="secondary"
              size="sm"
              className="mt-3"
            >
              {t('incompleteProfile.action')}
            </ButtonLink>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center rounded-card border border-karma-tan-dark/30 bg-white p-6 sm:p-10">
          {secretLoading ? (
            <div className="flex h-64 items-center justify-center text-karma-ink-soft">
              {t('loading')}
            </div>
          ) : secretError ? (
            <div className="w-full space-y-4 text-center">
              {secretError === 'offline_no_cache' && (
                <>
                  <p className="text-karma-ink-soft">{t('offline.message')}</p>
                  <ButtonLink to="/account" variant="primary">
                    {t('offline.action')}
                  </ButtonLink>
                </>
              )}
              {secretError === 'no_secret' && (
                <>
                  <p className="text-karma-ink-soft">{t('noSecret.message')}</p>
                  <ButtonLink to="/join" variant="primary">
                    {t('noSecret.action')}
                  </ButtonLink>
                </>
              )}
              {secretError === 'fetch_failed' && (
                <p className="text-karma-red">{t('fetchFailed')}</p>
              )}
              {secretError === 'reset_failed' && (
                <p className="text-karma-red">{t('resetFailed')}</p>
              )}
            </div>
          ) : qrDataUrl ? (
            <>
              {/* Nothing may overlap the code itself: anything drawn on top of
                  the finder patterns stops it scanning. */}
              <img
                src={qrDataUrl}
                alt={t('qrAlt')}
                width={280}
                height={280}
                className="h-auto w-full max-w-[280px] bg-white"
              />
              <div
                className="mt-4 h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-karma-tan-light"
                aria-hidden="true"
              >
                <div
                  key={cycle}
                  className="h-full origin-left bg-karma-tan"
                  style={{ animation: `karma-drain ${REFRESH_INTERVAL_MS}ms linear forwards` }}
                />
              </div>

              {profile?.full_name && (
                <p className="mt-6 text-center text-lg font-semibold text-karma-ink">
                  {profile.full_name}
                </p>
              )}

              <p className="mt-3 text-center text-xs text-karma-ink-soft">
                {t('refreshing')}
              </p>

              <div className="mt-6 w-full rounded-lg bg-karma-tan-light px-4 py-3 text-center text-sm text-karma-ink">
                {t('brightnessHint')}
              </div>

              <Button
                onClick={handleResetCode}
                disabled={resetting}
                variant="ghost"
                size="sm"
                className="mt-4"
              >
                {resetting ? t('reset.loading') : t('reset.button')}
              </Button>

              {resetSuccess && (
                <p className="mt-2 text-sm text-karma-red">{t('reset.success')}</p>
              )}
            </>
          ) : null}
        </div>

        <div className="mt-6 space-y-2 text-sm text-karma-ink-soft">
          <p>{t('note1')}</p>
          <p>{t('note2')}</p>
        </div>
      </Container>
    </Section>
  )
}

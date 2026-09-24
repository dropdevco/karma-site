import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { supabase, isOffline } from '@/lib/supabase'

const MIN_LENGTH = 8

export function PasswordSection() {
  const { t } = useTranslation('auth')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)

    if (password.length < MIN_LENGTH) {
      setError(t('account.password.errors.tooShort', { count: MIN_LENGTH }))
      return
    }
    if (password !== confirm) {
      setError(t('account.password.errors.mismatch'))
      return
    }

    setError(null)
    setSaving(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(t('account.password.errors.generic'))
        return
      }
      setPassword('')
      setConfirm('')
      setSaved(true)
    } catch (err) {
      setError(isOffline(err) ? t('account.password.errors.offline') : t('account.password.errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-8 rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
      <h2 className="text-xl font-bold text-karma-ink">{t('account.password.heading')}</h2>
      <p className="mt-2 text-sm text-karma-ink-soft">{t('account.password.intro')}</p>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="new-password" className="text-sm font-semibold text-karma-ink">
            {t('account.password.newLabel')}
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error ? true : undefined}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-karma-tan-dark/40 px-4 py-2.5 text-base text-karma-ink focus:border-karma-red focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="text-sm font-semibold text-karma-ink">
            {t('account.password.confirmLabel')}
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={error ? true : undefined}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-karma-tan-dark/40 px-4 py-2.5 text-base text-karma-ink focus:border-karma-red focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-karma-red">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm font-medium text-karma-ink">
            {t('account.password.saved')}
          </p>
        )}

        <Button type="submit" variant="secondary" size="md" disabled={saving} className="self-start">
          {saving ? t('account.password.saving') : t('account.password.save')}
        </Button>
      </form>
    </div>
  )
}

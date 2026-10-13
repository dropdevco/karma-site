import { useRef, useState } from 'react'
import type { ClipboardEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { AuthErrorCode } from './otpErrors'

interface CodeStepProps {
  email: string
  verifying: boolean
  errorCode: AuthErrorCode | null
  cooldown: number
  onSubmit: (code: string) => Promise<boolean>
  onResend: () => void
  onChangeEmail: () => void
}

/**
 * The email carries a sign-in link, so that is the primary instruction. The
 * 6-digit code is only a fallback for someone who opens the email on a
 * different device or browser, where the link cannot complete the sign-in.
 */
export function CodeStep({
  email,
  verifying,
  errorCode,
  cooldown,
  onSubmit,
  onResend,
  onChangeEmail,
}: CodeStepProps) {
  const { t } = useTranslation('auth')
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const error = errorCode ? t(`errors.${errorCode}`) : undefined
  const errorId = error ? 'signin-code-error' : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = await onSubmit(code)
    if (!ok) inputRef.current?.focus()
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\s+/g, '')
    if (pasted) {
      event.preventDefault()
      setCode(pasted)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div role="status" className="rounded-xl border border-karma-tan-dark/40 bg-karma-tan-light/60 px-4 py-4">
        <p className="font-display text-base font-semibold text-karma-ink">{t('codeStep.title')}</p>
        <p className="mt-1 text-sm text-karma-ink-soft">{t('codeStep.body', { email })}</p>
        <p className="mt-2 text-sm text-karma-ink-soft">{t('codeStep.hint')}</p>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-karma-red">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowCode((open) => !open)}
          aria-expanded={showCode}
          aria-controls="signin-code-panel"
          className="min-h-11 self-start font-display text-sm font-semibold text-karma-red underline-offset-2 hover:underline"
        >
          {t('codeStep.codeToggle')}
        </button>

        {showCode && (
          <form
            id="signin-code-panel"
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4 rounded-xl border border-karma-tan-dark/30 p-4"
          >
            <p className="text-sm text-karma-ink-soft">{t('codeStep.codeHelp')}</p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signin-code" className="font-display text-sm font-semibold text-karma-ink">
                {t('codeStep.label')}
              </label>
              <input
                ref={inputRef}
                id="signin-code"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                minLength={6}
                maxLength={10}
                required
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={errorId}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\s+/g, ''))}
                onPaste={handlePaste}
                placeholder={t('codeStep.placeholder')}
                className={cn(
                  'min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-center text-lg tracking-[0.3em] text-karma-ink focus:border-karma-red',
                  error && 'border-karma-red',
                )}
              />
            </div>

            <Button type="submit" size="lg" disabled={verifying || code.trim().length < 6} className="w-full">
              {verifying ? t('codeStep.submitting') : t('codeStep.submit')}
            </Button>
          </form>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm">
        <button
          type="button"
          onClick={onChangeEmail}
          className="min-h-11 font-display font-semibold text-karma-red underline-offset-2 hover:underline"
        >
          {t('codeStep.changeEmail')}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0}
          className="min-h-11 font-display font-semibold text-karma-red underline-offset-2 hover:underline disabled:pointer-events-none disabled:text-karma-ink-soft"
        >
          {cooldown > 0 ? t('codeStep.resendCooldown', { seconds: cooldown }) : t('codeStep.resend')}
        </button>
      </div>
    </div>
  )
}

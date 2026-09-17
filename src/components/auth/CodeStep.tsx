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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div aria-live="polite" role="status" className="sr-only">
        {error ?? ''}
      </div>

      <p className="text-sm text-karma-ink-soft">{t('codeStep.body', { email })}</p>

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
        {error && (
          <p id={errorId} className="text-sm font-medium text-karma-red">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={verifying || code.trim().length < 6}
        className="w-full"
      >
        {verifying ? t('codeStep.submitting') : t('codeStep.submit')}
      </Button>

      <div className="flex flex-col items-center gap-2 text-center text-sm text-karma-ink-soft">
        <p>{t('codeStep.hint')}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
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
    </form>
  )
}

import { useCallback, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, isOffline } from '@/lib/supabase'
import type { MemberSearchResult } from '@/lib/database.types'
import { Container, Section, Eyebrow } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { MemberSearchField } from '@/components/staff-points/MemberSearchField'
import { PointsAmountField, type AwardDirection } from '@/components/staff-points/PointsAmountField'
import { NoteField } from '@/components/staff-points/NoteField'
import { RecentAwardsList, type RecentAward } from '@/components/staff-points/RecentAwardsList'
import { awardErrorCode } from '@/components/staff-points/errors'
import { cn } from '@/lib/cn'

export function StaffPoints() {
  const { t } = useTranslation('staffPoints')

  const [member, setMember] = useState<MemberSearchResult | null>(null)
  const [direction, setDirection] = useState<AwardDirection>('give')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const [memberError, setMemberError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ memberName: string; points: number } | null>(null)
  const [recentAwards, setRecentAwards] = useState<RecentAward[]>([])

  const magnitude = Number.parseInt(amount, 10)
  const hasValidMagnitude = amount.trim() !== '' && Number.isInteger(magnitude) && magnitude > 0
  const signedPoints = hasValidMagnitude ? (direction === 'deduct' ? -magnitude : magnitude) : null

  const resetForm = useCallback(() => {
    setMember(null)
    setDirection('give')
    setAmount('')
    setNote('')
    setMemberError(null)
    setAmountError(null)
    setNoteError(null)
    setFormError(null)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (submitting) return

      let hasError = false
      setMemberError(null)
      setAmountError(null)
      setNoteError(null)
      setFormError(null)

      if (!member) {
        setMemberError(t('member.required'))
        hasError = true
      }
      if (!hasValidMagnitude) {
        setAmountError(t('points.amountRequired'))
        hasError = true
      }
      if (note.trim() === '') {
        setNoteError(t('note.required'))
        hasError = true
      }
      if (hasError || !member || signedPoints === null) return

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setFormError(t('errors.offline'))
        return
      }

      setSubmitting(true)
      try {
        const { error } = await supabase.rpc('award_manual_points', {
          p_user_id: member.user_id,
          p_points: signedPoints,
          p_note: note.trim(),
        })

        if (error) {
          if (isOffline(error)) {
            setFormError(t('errors.offline'))
            return
          }
          const code = awardErrorCode(error)
          switch (code) {
            case 'forbidden':
              setFormError(t('errors.forbidden'))
              break
            case 'invalid_points':
              setAmountError(t('points.amountRequired'))
              break
            case 'note_required':
              setNoteError(t('note.required'))
              break
            case 'member_not_found':
              setMemberError(t('member.notFound'))
              break
            default:
              setFormError(t('errors.generic'))
          }
          return
        }

        setConfirmation({ memberName: member.full_name, points: signedPoints })
        setRecentAwards((prev) => [
          { id: crypto.randomUUID(), memberName: member.full_name, points: signedPoints, note: note.trim(), at: Date.now() },
          ...prev,
        ])
        resetForm()
      } finally {
        setSubmitting(false)
      }
    },
    [submitting, member, hasValidMagnitude, note, signedPoints, resetForm, t],
  )

  return (
    <Section className="py-8 sm:py-10">
      <Container className="max-w-xl">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-karma-ink">{t('title')}</h1>
        <p className="mt-1 text-karma-ink-soft">{t('subtitle')}</p>

        {confirmation && (
          <div
            role="status"
            className="mt-5 rounded-card border-2 border-karma-red bg-karma-red-soft px-4 py-3 font-display text-sm font-semibold text-karma-ink"
          >
            {confirmation.points >= 0
              ? t('confirmation.given', { name: confirmation.memberName, points: confirmation.points })
              : t('confirmation.deducted', { name: confirmation.memberName, points: Math.abs(confirmation.points) })}
          </div>
        )}

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 flex flex-col gap-5" noValidate>
          <MemberSearchField
            id="staff-points-member"
            selected={member}
            onSelect={(selected) => {
              setMember(selected)
              setMemberError(null)
            }}
            onClear={() => setMember(null)}
            error={memberError ?? undefined}
          />

          <PointsAmountField
            id="staff-points-amount"
            direction={direction}
            onDirectionChange={setDirection}
            amount={amount}
            onAmountChange={setAmount}
            error={amountError ?? undefined}
          />

          <NoteField
            id="staff-points-note"
            label={t('note.label')}
            hint={t('note.hint')}
            value={note}
            onChange={(value) => {
              setNote(value)
              if (noteError) setNoteError(null)
            }}
            error={noteError ?? undefined}
            placeholder={t('note.placeholder')}
          />

          {member && signedPoints !== null && (
            <div
              className={cn(
                'rounded-card border-2 px-4 py-3 text-sm font-semibold',
                signedPoints < 0
                  ? 'border-karma-red bg-white text-karma-red'
                  : 'border-karma-tan-dark/30 bg-karma-tan-light text-karma-ink',
              )}
            >
              {signedPoints >= 0
                ? t('summary.give', { name: member.full_name, points: signedPoints })
                : t('summary.deduct', { name: member.full_name, points: Math.abs(signedPoints) })}
            </div>
          )}

          {formError && (
            <p role="alert" className="text-sm font-medium text-karma-red">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? t('submit.saving') : t('submit.cta')}
          </Button>
        </form>

        <RecentAwardsList awards={recentAwards} />
      </Container>
    </Section>
  )
}

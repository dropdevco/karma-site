import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { DonationRow } from '@/lib/database.types'
import type { LanguageCode } from '@/i18n'
import { formatLoggedAt, pickBilingual } from './format'
import { DonationForm, valuesFromDonation } from './DonationForm'

interface DonationListItemProps {
  donation: DonationRow
  eventId: string
  lang: LanguageCode
  onUpdated: (donation: DonationRow) => void
}

export function DonationListItem({ donation, eventId, lang, onUpdated }: DonationListItemProps) {
  const { t } = useTranslation('staffDonations')
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="rounded-card border border-karma-tan-dark/25 bg-white p-4">
        <h3 className="mb-3 font-display text-base font-bold text-karma-ink">{t('form.editTitle')}</h3>
        <DonationForm
          mode="edit"
          idPrefix={`edit-${donation.id}`}
          eventId={eventId}
          donationId={donation.id}
          initialValues={valuesFromDonation(donation)}
          onSaved={(updated) => {
            onUpdated(updated)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  const beneficiary = pickBilingual(donation.beneficiary_en, donation.beneficiary_es, lang)

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-card border border-karma-tan-dark/25 bg-white p-4">
      <div className="min-w-0">
        <p className="font-display text-base font-bold text-karma-ink">
          {donation.description}
          {donation.quantity !== null && (
            <span className="ml-2 font-sans text-sm font-semibold text-karma-red">
              {donation.unit
                ? t('list.quantityUnit', { quantity: donation.quantity, unit: donation.unit })
                : donation.quantity}
            </span>
          )}
        </p>
        {beneficiary && (
          <p className="mt-1 text-sm text-karma-ink-soft">{t('list.beneficiaryLabel', { beneficiary })}</p>
        )}
        {donation.notes && (
          <p className="mt-1 text-sm text-karma-ink-soft">{t('list.notesLabel', { notes: donation.notes })}</p>
        )}
        <p className="mt-1 text-xs text-karma-ink-soft">
          {t('list.loggedAt', { when: formatLoggedAt(donation.logged_at, lang) })}
        </p>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
        {t('list.editCta')}
      </Button>
    </li>
  )
}

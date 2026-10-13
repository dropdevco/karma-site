import { useTranslation } from 'react-i18next'
import type { StaffMemberRow } from '@/lib/database.types'
import { toLanguageCode } from '@/components/events/dateUtils'
import { RoleBadge } from './RoleBadge'

const LOCALES = { en: 'en-US', es: 'es-US' } as const

function useFormatters() {
  const { t, i18n } = useTranslation('staffMembers')
  const locale = LOCALES[toLanguageCode(i18n.language)]
  const dateFormat = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  const formatDate = (iso: string) => dateFormat.format(new Date(iso))
  const formatLast = (iso: string | null) => (iso ? formatDate(iso) : t('never'))
  const language = (code: StaffMemberRow['preferred_language']) => t(`languages.${code}`)
  const hasName = (m: StaffMemberRow) => m.full_name.trim() !== ''
  const name = (m: StaffMemberRow) => (hasName(m) ? m.full_name : t('noName'))
  return { t, formatDate, formatLast, language, hasName, name, number: new Intl.NumberFormat(locale) }
}

export function MembersList({ members }: { members: StaffMemberRow[] }) {
  const { t, formatDate, formatLast, language, hasName, name, number } = useFormatters()
  const dash = t('none')

  return (
    <>
      <div className="mt-4 hidden overflow-x-auto rounded-card border border-karma-tan-dark/25 bg-white sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{t('table.caption')}</caption>
          <thead className="bg-karma-tan-light text-xs uppercase tracking-wide text-karma-ink-soft">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">{t('columns.name')}</th>
              <th scope="col" className="px-4 py-3 font-semibold">{t('columns.contact')}</th>
              <th scope="col" className="px-4 py-3 font-semibold">{t('columns.role')}</th>
              <th scope="col" className="px-4 py-3 font-semibold">{t('columns.language')}</th>
              <th scope="col" className="px-4 py-3 font-semibold">{t('columns.joined')}</th>
              <th scope="col" className="px-4 py-3 font-semibold">{t('columns.lastSignIn')}</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">{t('columns.points')}</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">{t('columns.checkIns')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-karma-tan-dark/15">
            {members.map((m) => (
              <tr key={m.user_id}>
                <th scope="row" className="px-4 py-3 text-left font-semibold text-karma-ink">
                  {hasName(m) ? name(m) : <span className="font-normal italic text-karma-ink-soft">{name(m)}</span>}
                </th>
                <td className="px-4 py-3 text-karma-ink-soft">
                  <div className="break-all">{m.email ?? dash}</div>
                  <div>{m.phone ?? dash}</div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={m.role} />
                </td>
                <td className="px-4 py-3 text-karma-ink-soft">{language(m.preferred_language)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-karma-ink-soft">{formatDate(m.created_at)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-karma-ink-soft">{formatLast(m.last_sign_in_at)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-karma-ink">
                  {number.format(m.total_points)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-karma-ink-soft">
                  {number.format(m.check_in_count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 flex flex-col gap-3 sm:hidden">
        {members.map((m) => (
          <li key={m.user_id} className="rounded-card border border-karma-tan-dark/25 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <h3
                className={
                  hasName(m) ? 'font-display text-base font-bold text-karma-ink' : 'italic text-karma-ink-soft'
                }
              >
                {name(m)}
              </h3>
              <RoleBadge role={m.role} />
            </div>
            <p className="mt-1 break-all text-sm text-karma-ink-soft">{m.email ?? dash}</p>
            <p className="text-sm text-karma-ink-soft">{m.phone ?? dash}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-karma-ink-soft">{t('columns.language')}</dt>
                <dd className="text-karma-ink">{language(m.preferred_language)}</dd>
              </div>
              <div>
                <dt className="text-xs text-karma-ink-soft">{t('columns.joined')}</dt>
                <dd className="text-karma-ink">{formatDate(m.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-karma-ink-soft">{t('columns.lastSignIn')}</dt>
                <dd className="text-karma-ink">{formatLast(m.last_sign_in_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-karma-ink-soft">{t('columns.points')}</dt>
                <dd className="font-semibold text-karma-ink">{number.format(m.total_points)}</dd>
              </div>
              <div>
                <dt className="text-xs text-karma-ink-soft">{t('columns.checkIns')}</dt>
                <dd className="text-karma-ink">{number.format(m.check_in_count)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container, Section, Eyebrow } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { useStaffMembers } from '@/components/staff-members/useStaffMembers'
import { MembersList } from '@/components/staff-members/MembersList'
import { ROLE_FILTERS, filterMembers, summarize, type RoleFilter } from '@/components/staff-members/filters'

const fieldClass =
  'w-full rounded-xl border border-karma-tan-dark/40 bg-white px-3 py-2 text-karma-ink focus:border-karma-red focus:outline-none focus:ring-2 focus:ring-karma-red/30'

export function StaffMembers() {
  const { t } = useTranslation('staffMembers')
  const { state, members, reload } = useStaffMembers()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')

  const summary = useMemo(() => summarize(members), [members])
  const visible = useMemo(() => filterMembers(members, query, role), [members, query, role])

  const stats = [
    { label: t('summary.total'), value: summary.total },
    { label: t('summary.staff'), value: summary.staff },
    { label: t('summary.recent'), value: summary.recent },
  ]

  return (
    <Section className="pb-24 pt-10 sm:pt-14">
      <Container>
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold text-karma-ink sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 max-w-xl text-karma-ink-soft">{t('subtitle')}</p>

        {state === 'loading' && (
          <p className="mt-10 text-center text-karma-ink-soft" aria-busy="true">
            {t('loading')}
          </p>
        )}

        {(state === 'error' || state === 'offline') && (
          <div className="mt-10 rounded-card border border-karma-red/30 bg-karma-red-soft p-6 text-center">
            <p className="font-medium text-karma-red-dark">
              {state === 'offline' ? t('offlineError') : t('loadError')}
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={reload}>
              {t('retry')}
            </Button>
          </div>
        )}

        {state === 'ready' && (
          <>
            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-card border border-karma-tan-dark/25 bg-white px-4 py-3">
                  <dt className="text-sm text-karma-ink-soft">{stat.label}</dt>
                  <dd className="font-display text-2xl font-bold text-karma-ink">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label htmlFor="staff-members-search" className="mb-1 block text-sm font-medium text-karma-ink">
                  {t('search.label')}
                </label>
                <input
                  id="staff-members-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('search.placeholder')}
                  autoComplete="off"
                  className={fieldClass}
                />
              </div>
              <div className="sm:w-48">
                <label htmlFor="staff-members-role" className="mb-1 block text-sm font-medium text-karma-ink">
                  {t('roleFilter.label')}
                </label>
                <select
                  id="staff-members-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as RoleFilter)}
                  className={fieldClass}
                >
                  {ROLE_FILTERS.map((value) => (
                    <option key={value} value={value}>
                      {value === 'all' ? t('roleFilter.all') : t(`roles.${value}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-3 text-sm text-karma-ink-soft" role="status">
              {t('showing', { shown: visible.length, total: members.length })}
            </p>

            {members.length === 0 ? (
              <div className="mt-4 rounded-card border border-karma-tan-dark/25 bg-white p-10 text-center">
                <h2 className="font-display text-xl font-bold text-karma-ink">{t('empty.title')}</h2>
                <p className="mx-auto mt-2 max-w-md text-karma-ink-soft">{t('empty.body')}</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="mt-4 rounded-card border border-karma-tan-dark/25 bg-white p-10 text-center">
                <h2 className="font-display text-xl font-bold text-karma-ink">{t('noMatch.title')}</h2>
                <p className="mx-auto mt-2 max-w-md text-karma-ink-soft">{t('noMatch.body')}</p>
              </div>
            ) : (
              <MembersList members={visible} />
            )}
          </>
        )}
      </Container>
    </Section>
  )
}

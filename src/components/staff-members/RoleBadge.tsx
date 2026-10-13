import { useTranslation } from 'react-i18next'
import type { StaffMemberRow } from '@/lib/database.types'
import { cn } from '@/lib/cn'

export function RoleBadge({ role }: { role: StaffMemberRow['role'] }) {
  const { t } = useTranslation('staffMembers')
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
        role === 'member' ? 'bg-karma-tan-light text-karma-ink-soft' : 'bg-karma-red-soft text-karma-red-dark',
      )}
    >
      {t(`roles.${role}`)}
    </span>
  )
}

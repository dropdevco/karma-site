import type { StaffMemberRow } from '@/lib/database.types'

export type RoleFilter = 'all' | StaffMemberRow['role']

export const ROLE_FILTERS: RoleFilter[] = ['all', 'member', 'staff', 'admin']

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export function filterMembers(members: StaffMemberRow[], query: string, role: RoleFilter): StaffMemberRow[] {
  const needle = query.trim().toLowerCase()
  return members.filter((m) => {
    if (role !== 'all' && m.role !== role) return false
    if (needle === '') return true
    return [m.full_name, m.email, m.phone].some((field) => field?.toLowerCase().includes(needle))
  })
}

export function summarize(members: StaffMemberRow[]) {
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return {
    total: members.length,
    staff: members.filter((m) => m.role === 'staff' || m.role === 'admin').length,
    recent: members.filter((m) => new Date(m.created_at).getTime() >= cutoff).length,
  }
}

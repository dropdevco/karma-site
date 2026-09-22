import type { DonationRow } from '@/lib/database.types'

export type DonationTotal = { unit: string; total: number }

/** Sums quantity by unit so "cans" and "$" are never added together. Entries missing a quantity or unit are left out of every total — they still show up in the list itself. */
export function computeDonationTotals(donations: DonationRow[]): DonationTotal[] {
  const sums = new Map<string, number>()

  for (const donation of donations) {
    if (donation.quantity === null) continue
    const unit = donation.unit?.trim()
    if (!unit) continue
    sums.set(unit, (sums.get(unit) ?? 0) + donation.quantity)
  }

  return Array.from(sums.entries())
    .map(([unit, total]) => ({ unit, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => a.unit.localeCompare(b.unit))
}

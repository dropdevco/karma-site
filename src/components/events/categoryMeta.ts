import type { EventCategory } from '@/data/events'

export const CATEGORY_ORDER: readonly EventCategory[] = ['soccer', 'basketball', 'running', 'volleyball']

export function isEventCategory(value: string): value is EventCategory {
  return (CATEGORY_ORDER as readonly string[]).includes(value)
}

import type { EventCategory } from '@/lib/eventsApi'

export const CATEGORY_ORDER: readonly EventCategory[] = ['soccer', 'basketball', 'running', 'volleyball']

export function isEventCategory(value: string): value is EventCategory {
  return (CATEGORY_ORDER as readonly string[]).includes(value)
}

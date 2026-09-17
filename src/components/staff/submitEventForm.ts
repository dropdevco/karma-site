import { isOffline } from '@/lib/supabase'
import type { EventCategory, EventInsert } from '@/lib/database.types'
import { dateTimeLocalToIso } from './dateTime'
import type { EventFormValues } from './eventFormTypes'
import { supabase } from '@/lib/supabase'

export type SaveEventResult = { ok: true } | { ok: false; reason: 'offline' | 'permission' | 'unknown' }

function isPermissionError(error: { code?: string; message?: string }): boolean {
  if (error.code === '42501') return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('row-level security') || message.includes('permission denied')
}

function toPayload(values: EventFormValues): Omit<EventInsert, 'status' | 'series_id'> {
  const startIso = dateTimeLocalToIso(values.starts_at)
  const endIso = dateTimeLocalToIso(values.ends_at)
  if (!startIso || !endIso) throw new Error('invalid_dates')

  return {
    slug: values.slug.trim(),
    title_en: values.title_en.trim(),
    title_es: values.title_es.trim(),
    description_en: values.description_en.trim(),
    description_es: values.description_es.trim(),
    category: values.category as EventCategory,
    starts_at: startIso,
    ends_at: endIso,
    venue_name: values.venue_name.trim(),
    venue_address: values.venue_address.trim(),
    capacity: Number(values.capacity),
    donation_item_en: values.donation_item_en.trim(),
    donation_item_es: values.donation_item_es.trim(),
    donation_suggestion_en: values.donation_suggestion_en.trim(),
    donation_suggestion_es: values.donation_suggestion_es.trim(),
    beneficiary_en: values.beneficiary_en.trim(),
    beneficiary_es: values.beneficiary_es.trim(),
    recurring: values.recurring,
  }
}

export async function createEvent(values: EventFormValues): Promise<SaveEventResult> {
  try {
    const payload: EventInsert = { ...toPayload(values), status: 'scheduled', series_id: null }
    const { error } = await supabase.from('events').insert(payload)
    if (error) {
      if (isPermissionError(error)) return { ok: false, reason: 'permission' }
      return { ok: false, reason: 'unknown' }
    }
    return { ok: true }
  } catch (error) {
    if (isOffline(error)) return { ok: false, reason: 'offline' }
    return { ok: false, reason: 'unknown' }
  }
}

export async function updateEvent(id: string, values: EventFormValues): Promise<SaveEventResult> {
  try {
    const payload = toPayload(values)
    const { error } = await supabase.from('events').update(payload).eq('id', id)
    if (error) {
      if (isPermissionError(error)) return { ok: false, reason: 'permission' }
      return { ok: false, reason: 'unknown' }
    }
    return { ok: true }
  } catch (error) {
    if (isOffline(error)) return { ok: false, reason: 'offline' }
    return { ok: false, reason: 'unknown' }
  }
}

export async function setEventStatus(
  id: string,
  status: 'scheduled' | 'cancelled',
): Promise<SaveEventResult> {
  try {
    const { error } = await supabase.from('events').update({ status }).eq('id', id)
    if (error) {
      if (isPermissionError(error)) return { ok: false, reason: 'permission' }
      return { ok: false, reason: 'unknown' }
    }
    return { ok: true }
  } catch (error) {
    if (isOffline(error)) return { ok: false, reason: 'offline' }
    return { ok: false, reason: 'unknown' }
  }
}

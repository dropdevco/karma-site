import { isOffline, supabase } from '@/lib/supabase'
import type { DonationInsert, DonationRow, DonationUpdate } from '@/lib/database.types'
import type { DonationFormValues } from './validateDonationForm'

export type SaveDonationResult =
  | { ok: true; donation: DonationRow }
  | { ok: false; reason: 'offline' | 'permission' | 'unknown' }

function isPermissionError(error: { code?: string; message?: string }): boolean {
  if (error.code === '42501') return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('row-level security') || message.includes('permission denied')
}

function toPayload(values: DonationFormValues) {
  const trimmedQuantity = values.quantity.trim()
  return {
    description: values.description.trim(),
    quantity: trimmedQuantity ? Number(trimmedQuantity) : null,
    unit: values.unit.trim() || null,
    beneficiary_en: values.beneficiary_en.trim() || null,
    beneficiary_es: values.beneficiary_es.trim() || null,
    notes: values.notes.trim() || null,
  }
}

export async function createDonation(eventId: string, values: DonationFormValues): Promise<SaveDonationResult> {
  try {
    const payload: DonationInsert = { event_id: eventId, ...toPayload(values) }
    const { data, error } = await supabase.from('donations').insert(payload).select().single()
    if (error || !data) {
      if (error && isPermissionError(error)) return { ok: false, reason: 'permission' }
      return { ok: false, reason: 'unknown' }
    }
    return { ok: true, donation: data }
  } catch (error) {
    if (isOffline(error)) return { ok: false, reason: 'offline' }
    return { ok: false, reason: 'unknown' }
  }
}

export async function updateDonation(id: string, values: DonationFormValues): Promise<SaveDonationResult> {
  try {
    const payload: DonationUpdate = toPayload(values)
    const { data, error } = await supabase.from('donations').update(payload).eq('id', id).select().single()
    if (error || !data) {
      if (error && isPermissionError(error)) return { ok: false, reason: 'permission' }
      return { ok: false, reason: 'unknown' }
    }
    return { ok: true, donation: data }
  } catch (error) {
    if (isOffline(error)) return { ok: false, reason: 'offline' }
    return { ok: false, reason: 'unknown' }
  }
}

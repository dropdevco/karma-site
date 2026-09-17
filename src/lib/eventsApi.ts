import { supabase, rpcErrorCode, isOffline } from '@/lib/supabase'
import type {
  EventRow,
  EventAvailabilityRow,
  RegistrationRow,
  RegistrationStatus,
  EventStatus,
  EventCategory,
} from '@/lib/database.types'

export type { EventCategory, EventStatus, RegistrationStatus }

export interface LocalizedText {
  en: string
  es: string
}

export interface EventVenue {
  name: string
  address: string
}

export interface EventDonationDrive {
  itemType: LocalizedText
  suggestion: LocalizedText
}

export interface KarmaEvent {
  id: string
  slug: string
  title: LocalizedText
  description: LocalizedText
  category: EventCategory
  startsAt: string
  endsAt: string
  venue: EventVenue
  capacity: number
  spotsTaken: number
  waitlistCount: number
  donation: EventDonationDrive
  beneficiary: LocalizedText
  recurring: boolean
  seriesId: string | null
  status: EventStatus
}

export interface MyRegistration {
  registrationId: string
  status: RegistrationStatus
  event: KarmaEvent
}

/** A domain failure surfaced by an RPC, or 'offline' / 'unknown' for anything else. */
export type EventApiErrorCode =
  | 'not_authenticated'
  | 'event_not_found'
  | 'event_cancelled'
  | 'event_ended'
  | 'event_started'
  | 'profile_incomplete'
  | 'under_18'
  | 'waiver_required'
  | 'offline'
  | 'unknown'

export type EventApiResult<T> = { ok: true; data: T } | { ok: false; code: EventApiErrorCode }

function resolveErrorCode(error: unknown): EventApiErrorCode {
  if (isOffline(error)) return 'offline'
  const code = rpcErrorCode(error)
  switch (code) {
    case 'not_authenticated':
    case 'event_not_found':
    case 'event_cancelled':
    case 'event_ended':
    case 'event_started':
    case 'profile_incomplete':
    case 'under_18':
    case 'waiver_required':
      return code
    default:
      return 'unknown'
  }
}

function mapEventRow(row: EventRow, availability?: EventAvailabilityRow): KarmaEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en, es: row.title_es },
    description: { en: row.description_en, es: row.description_es },
    category: row.category,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    venue: { name: row.venue_name, address: row.venue_address },
    capacity: row.capacity,
    spotsTaken: availability?.registered_count ?? 0,
    waitlistCount: availability?.waitlist_count ?? 0,
    donation: {
      itemType: { en: row.donation_item_en, es: row.donation_item_es },
      suggestion: { en: row.donation_suggestion_en, es: row.donation_suggestion_es },
    },
    beneficiary: { en: row.beneficiary_en, es: row.beneficiary_es },
    recurring: row.recurring,
    seriesId: row.series_id,
    status: row.status,
  }
}

async function fetchAvailabilityMap(eventIds: string[] | null): Promise<Map<string, EventAvailabilityRow>> {
  const { data, error } = await supabase.rpc('get_event_availability', { p_event_ids: eventIds })
  if (error) throw error
  const map = new Map<string, EventAvailabilityRow>()
  for (const row of data ?? []) map.set(row.event_id, row)
  return map
}

/** All events (any status, any date) for the /events calendar. Public — works signed out. */
export async function fetchAllEvents(): Promise<KarmaEvent[]> {
  const [{ data: rows, error }, availability] = await Promise.all([
    supabase.from('events').select('*').order('starts_at', { ascending: true }),
    fetchAvailabilityMap(null),
  ])
  if (error) throw error
  return (rows ?? []).map((row) => mapEventRow(row, availability.get(row.id)))
}

/** The next few scheduled, upcoming events for the home page teaser. Public. */
export async function fetchUpcomingEvents(limit: number): Promise<KarmaEvent[]> {
  const { data: rows, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'scheduled')
    .gte('ends_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  if (!rows || rows.length === 0) return []
  const availability = await fetchAvailabilityMap(rows.map((row) => row.id))
  return rows.map((row) => mapEventRow(row, availability.get(row.id)))
}

/** A single event by slug, with fresh availability. Public. */
export async function fetchEventBySlug(slug: string): Promise<KarmaEvent | null> {
  const { data: row, error } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!row) return null
  const availability = await fetchAvailabilityMap([row.id])
  return mapEventRow(row, availability.get(row.id))
}

/** Just the live counts for one event — used to refresh after register/cancel. */
export async function fetchEventAvailability(eventId: string): Promise<EventAvailabilityRow | null> {
  const availability = await fetchAvailabilityMap([eventId])
  return availability.get(eventId) ?? null
}

/**
 * The signed-in member's own current registration status for one event, or
 * null if they have never had one. A prior 'cancelled' row is returned as-is
 * so the caller can treat it as "not registered".
 */
export async function fetchMyRegistrationForEvent(eventId: string, userId: string): Promise<RegistrationRow | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

/** All of the signed-in member's non-cancelled registrations, with their events attached. */
export async function fetchMyRegistrations(userId: string): Promise<MyRegistration[]> {
  const { data: regs, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['registered', 'waitlisted'])
  if (error) throw error
  if (!regs || regs.length === 0) return []

  const eventIds = Array.from(new Set(regs.map((reg) => reg.event_id)))
  const [{ data: rows, error: eventsError }, availability] = await Promise.all([
    supabase.from('events').select('*').in('id', eventIds),
    fetchAvailabilityMap(eventIds),
  ])
  if (eventsError) throw eventsError

  const eventsById = new Map<string, EventRow>((rows ?? []).map((row) => [row.id, row]))

  const results: MyRegistration[] = []
  for (const reg of regs) {
    const row = eventsById.get(reg.event_id)
    if (!row) continue
    results.push({
      registrationId: reg.id,
      status: reg.status,
      event: mapEventRow(row, availability.get(row.id)),
    })
  }
  return results
}

export async function registerForEvent(eventId: string): Promise<EventApiResult<RegistrationStatus>> {
  const { data, error } = await supabase.rpc('register_for_event', { p_event_id: eventId })
  if (error) return { ok: false, code: resolveErrorCode(error) }
  return { ok: true, data: data as RegistrationStatus }
}

export async function cancelMyRegistration(eventId: string): Promise<EventApiResult<void>> {
  const { error } = await supabase.rpc('cancel_my_registration', { p_event_id: eventId })
  if (error) return { ok: false, code: resolveErrorCode(error) }
  return { ok: true, data: undefined }
}

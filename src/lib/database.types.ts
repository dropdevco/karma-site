export type LanguageCode = 'en' | 'es'
export type MemberRole = 'member' | 'staff' | 'admin'
export type EventCategory = 'soccer' | 'basketball' | 'running' | 'volleyball'
export type ActivityKey = EventCategory | 'other'
export type HeardAboutKey = 'friend' | 'event' | 'social' | 'search' | 'other'
export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled'
export type EventStatus = 'scheduled' | 'cancelled'
export type CheckInMethod = 'qr' | 'manual'

export interface ProfileRow {
  id: string
  full_name: string
  phone: string | null
  date_of_birth: string | null
  preferred_language: LanguageCode
  activities: ActivityKey[]
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  photo_consent: boolean
  reminder_opt_in: boolean
  heard_about: HeardAboutKey | null
  role: MemberRole
  created_at: string
  updated_at: string
}

/** Columns a member is allowed to write to their own profile. */
export type ProfileUpdate = Partial<
  Pick<
    ProfileRow,
    | 'full_name'
    | 'phone'
    | 'date_of_birth'
    | 'preferred_language'
    | 'activities'
    | 'emergency_contact_name'
    | 'emergency_contact_phone'
    | 'photo_consent'
    | 'reminder_opt_in'
    | 'heard_about'
  >
>

export interface EventRow {
  id: string
  slug: string
  title_en: string
  title_es: string
  description_en: string
  description_es: string
  category: EventCategory
  starts_at: string
  ends_at: string
  venue_name: string
  venue_address: string
  capacity: number
  donation_item_en: string
  donation_item_es: string
  donation_suggestion_en: string
  donation_suggestion_es: string
  beneficiary_en: string
  beneficiary_es: string
  recurring: boolean
  series_id: string | null
  status: EventStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type EventInsert = Omit<
  EventRow,
  'id' | 'created_at' | 'updated_at' | 'created_by'
> & { id?: string }

export interface RegistrationRow {
  id: string
  event_id: string
  user_id: string
  status: RegistrationStatus
  status_changed_at: string
  created_at: string
}

export interface CheckInRow {
  id: string
  event_id: string
  user_id: string
  method: CheckInMethod
  scanned_at: string
  synced_at: string
  checked_in_by: string | null
  client_scan_id: string
}

export interface WalkInRow {
  id: string
  event_id: string
  full_name: string
  email: string | null
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  confirmed_adult: boolean
  waiver_acknowledged: boolean
  waiver_version: string
  recorded_by: string | null
  recorded_at: string
  synced_at: string
}

export interface MemberQrSecretRow {
  user_id: string
  secret: string
  rotated_at: string
}

export interface WaiverAcceptanceRow {
  id: string
  user_id: string
  waiver_version: string
  accepted_at: string
}

export interface AccountStatus {
  role: MemberRole
  profile_complete: boolean
  is_adult: boolean
  waiver_version: string
  waiver_current: boolean
}

export interface EventAvailabilityRow {
  event_id: string
  capacity: number
  registered_count: number
  waitlist_count: number
}

export interface EventRosterRow {
  user_id: string
  full_name: string
  qr_secret: string
  registration_status: RegistrationStatus | null
  checked_in: boolean
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
}

export interface SyncCheckInResult {
  client_scan_id: string | null
  result: string
}

export interface SyncWalkInResult {
  walk_in_id: string | null
  result: string
}

export interface CheckInScanPayload {
  client_scan_id: string
  event_id: string
  user_id: string
  method: CheckInMethod
  scanned_at: string
  qr_window?: number
  qr_sig?: string
}

export interface WalkInPayload {
  id: string
  event_id: string
  full_name: string
  email?: string | null
  phone?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  confirmed_adult: boolean
  waiver_acknowledged: boolean
  waiver_version: string
  recorded_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: never; Update: ProfileUpdate }
      events: { Row: EventRow; Insert: EventInsert; Update: Partial<EventInsert> }
      registrations: { Row: RegistrationRow; Insert: never; Update: never }
      check_ins: { Row: CheckInRow; Insert: never; Update: never }
      walk_ins: { Row: WalkInRow; Insert: never; Update: never }
      member_qr_secrets: { Row: MemberQrSecretRow; Insert: never; Update: never }
      waiver_acceptances: { Row: WaiverAcceptanceRow; Insert: never; Update: never }
    }
    Views: Record<string, never>
    Functions: {
      current_waiver_version: { Args: Record<PropertyKey, never>; Returns: string }
      get_my_account_status: { Args: Record<PropertyKey, never>; Returns: AccountStatus | null }
      accept_current_waiver: { Args: Record<PropertyKey, never>; Returns: void }
      rotate_my_qr_secret: { Args: Record<PropertyKey, never>; Returns: void }
      register_for_event: { Args: { p_event_id: string }; Returns: RegistrationStatus }
      cancel_my_registration: { Args: { p_event_id: string }; Returns: void }
      get_event_availability: {
        Args: { p_event_ids?: string[] | null }
        Returns: EventAvailabilityRow[]
      }
      get_event_roster: { Args: { p_event_id: string }; Returns: EventRosterRow[] }
      sync_check_ins: { Args: { p_scans: CheckInScanPayload[] }; Returns: SyncCheckInResult[] }
      sync_walk_ins: { Args: { p_walk_ins: WalkInPayload[] }; Returns: SyncWalkInResult[] }
      is_staff: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

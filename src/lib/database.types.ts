export type LanguageCode = 'en' | 'es'
export type MemberRole = 'member' | 'staff' | 'admin'
export type EventCategory = 'soccer' | 'basketball' | 'running' | 'volleyball'
export type ActivityKey = EventCategory | 'other'
export type HeardAboutKey = 'friend' | 'event' | 'social' | 'search' | 'other'
export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled'
export type EventStatus = 'scheduled' | 'cancelled'
export type CheckInMethod = 'qr' | 'manual'

export type ProfileRow = {
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
  leaderboard_visible: boolean
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
    | 'leaderboard_visible'
  >
>

export type EventRow = {
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

export type RegistrationRow = {
  id: string
  event_id: string
  user_id: string
  status: RegistrationStatus
  status_changed_at: string
  created_at: string
}

export type CheckInRow = {
  id: string
  event_id: string
  user_id: string
  method: CheckInMethod
  scanned_at: string
  synced_at: string
  checked_in_by: string | null
  client_scan_id: string
}

export type WalkInRow = {
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

export type MemberQrSecretRow = {
  user_id: string
  secret: string
  rotated_at: string
}

export type WaiverAcceptanceRow = {
  id: string
  user_id: string
  waiver_version: string
  accepted_at: string
}

export type AccountStatus = {
  role: MemberRole
  profile_complete: boolean
  is_adult: boolean
  waiver_version: string
  waiver_current: boolean
}

export type EventAvailabilityRow = {
  event_id: string
  capacity: number
  registered_count: number
  waitlist_count: number
}

export type EventRosterRow = {
  user_id: string
  full_name: string
  qr_secret: string
  registration_status: RegistrationStatus | null
  checked_in: boolean
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
}

export type SyncCheckInResult = {
  client_scan_id: string | null
  result: string
}

export type SyncWalkInResult = {
  walk_in_id: string | null
  result: string
}

export type CheckInScanPayload = {
  client_scan_id: string
  event_id: string
  user_id: string
  method: CheckInMethod
  scanned_at: string
  qr_window?: number
  qr_sig?: string
  category_ids?: string[]
}

export type PointEventKind = 'attendance' | 'category_bonus' | 'manual' | 'adjustment'

export type EventPointCategoryRow = {
  id: string
  event_id: string
  label_en: string
  label_es: string
  points: number
  sort_order: number
  created_at: string
}

export type EventPointCategoryInsert = Pick<EventPointCategoryRow, 'event_id' | 'label_en' | 'label_es' | 'points'> &
  Partial<Pick<EventPointCategoryRow, 'sort_order'>>

export type EventPointCategoryUpdate = Partial<
  Pick<EventPointCategoryRow, 'label_en' | 'label_es' | 'points' | 'sort_order'>
>

export type CheckInPointCategoryRow = {
  id: string
  check_in_id: string
  category_id: string | null
  label_en: string
  label_es: string
  points_awarded: number
  created_at: string
}

export type MemberSearchResult = {
  user_id: string
  full_name: string
}

export type PointEventRow = {
  id: string
  user_id: string
  event_id: string | null
  kind: PointEventKind
  points: number
  note: string | null
  reverses: string | null
  created_by: string | null
  created_at: string
}

export type PointsConfigRow = {
  id: true
  attendance_points: number
  updated_at: string
}

export type LeaderboardRow = {
  user_id: string
  full_name: string
  total_points: number
  rank: number
}

export type MyPointsSummary = {
  total_points: number
  rank: number | null
  member_count: number
}

export type DonationRow = {
  id: string
  event_id: string
  description: string
  quantity: number | null
  unit: string | null
  beneficiary_en: string | null
  beneficiary_es: string | null
  notes: string | null
  logged_by: string | null
  logged_at: string
}

export type DonationInsert = Pick<DonationRow, 'event_id' | 'description'> &
  Partial<Pick<DonationRow, 'quantity' | 'unit' | 'beneficiary_en' | 'beneficiary_es' | 'notes'>>

export type DonationUpdate = Partial<
  Pick<DonationRow, 'description' | 'quantity' | 'unit' | 'beneficiary_en' | 'beneficiary_es' | 'notes'>
>

export type WalkInPayload = {
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

/**
 * Shaped to satisfy postgrest-js's structural constraints, which are easy to
 * trip: every table needs `Relationships`, and each type must be a `type`
 * alias rather than an `interface` — only aliases get TypeScript's implicit
 * index signature, so an interface here silently collapses the whole client
 * to `never`. Writes to the tables marked below are rejected by row level
 * security no matter what these types permit.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Partial<ProfileRow> & { id: string }
        Update: ProfileUpdate
        Relationships: []
      }
      events: {
        Row: EventRow
        Insert: EventInsert
        Update: Partial<EventInsert>
        Relationships: []
      }
      registrations: {
        Row: RegistrationRow
        Insert: Partial<RegistrationRow>
        Update: Partial<RegistrationRow>
        Relationships: []
      }
      check_ins: {
        Row: CheckInRow
        Insert: Partial<CheckInRow>
        Update: Partial<CheckInRow>
        Relationships: []
      }
      walk_ins: {
        Row: WalkInRow
        Insert: Partial<WalkInRow>
        Update: Partial<WalkInRow>
        Relationships: []
      }
      member_qr_secrets: {
        Row: MemberQrSecretRow
        Insert: Partial<MemberQrSecretRow>
        Update: Partial<MemberQrSecretRow>
        Relationships: []
      }
      waiver_acceptances: {
        Row: WaiverAcceptanceRow
        Insert: Partial<WaiverAcceptanceRow>
        Update: Partial<WaiverAcceptanceRow>
        Relationships: []
      }
      point_events: {
        Row: PointEventRow
        Insert: Partial<PointEventRow>
        Update: Partial<PointEventRow>
        Relationships: []
      }
      points_config: {
        Row: PointsConfigRow
        Insert: Partial<PointsConfigRow>
        Update: Partial<PointsConfigRow>
        Relationships: []
      }
      donations: {
        Row: DonationRow
        Insert: DonationInsert
        Update: DonationUpdate
        Relationships: []
      }
      event_point_categories: {
        Row: EventPointCategoryRow
        Insert: EventPointCategoryInsert
        Update: EventPointCategoryUpdate
        Relationships: []
      }
      check_in_point_categories: {
        Row: CheckInPointCategoryRow
        Insert: Partial<CheckInPointCategoryRow>
        Update: Partial<CheckInPointCategoryRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      current_waiver_version: { Args: Record<string, never>; Returns: string }
      get_my_account_status: { Args: Record<string, never>; Returns: AccountStatus | null }
      accept_current_waiver: { Args: Record<string, never>; Returns: undefined }
      rotate_my_qr_secret: { Args: Record<string, never>; Returns: undefined }
      register_for_event: { Args: { p_event_id: string }; Returns: RegistrationStatus }
      cancel_my_registration: { Args: { p_event_id: string }; Returns: undefined }
      get_event_availability: {
        Args: { p_event_ids: string[] | null }
        Returns: EventAvailabilityRow[]
      }
      get_event_roster: { Args: { p_event_id: string }; Returns: EventRosterRow[] }
      sync_check_ins: { Args: { p_scans: CheckInScanPayload[] }; Returns: SyncCheckInResult[] }
      sync_walk_ins: { Args: { p_walk_ins: WalkInPayload[] }; Returns: SyncWalkInResult[] }
      is_staff: { Args: Record<string, never>; Returns: boolean }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      get_leaderboard: { Args: { p_limit?: number }; Returns: LeaderboardRow[] }
      get_my_points_summary: { Args: Record<string, never>; Returns: MyPointsSummary | null }
      void_point_event: { Args: { p_point_event_id: string; p_note?: string }; Returns: undefined }
      award_manual_points: { Args: { p_user_id: string; p_points: number; p_note: string }; Returns: undefined }
      search_members: { Args: { p_query?: string }; Returns: MemberSearchResult[] }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

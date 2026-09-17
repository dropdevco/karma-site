import { supabase } from '@/lib/supabase'
import type { AccountStatus, ProfileUpdate } from '@/lib/database.types'

export async function updateMyProfile(userId: string, patch: ProfileUpdate): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}

export async function getMyAccountStatus(): Promise<AccountStatus | null> {
  const { data, error } = await supabase.rpc('get_my_account_status')
  if (error) throw error
  return data
}

export async function acceptCurrentWaiver(): Promise<void> {
  const { error } = await supabase.rpc('accept_current_waiver')
  if (error) throw error
}

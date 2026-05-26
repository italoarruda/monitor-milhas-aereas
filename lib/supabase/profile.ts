import { supabase } from './client'
import type { UserProfile } from '@/lib/types'

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as UserProfile
}

export async function upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ ...profile, updated_at: new Date().toISOString() }, { onConflict: 'id' })

  if (error) throw error
}

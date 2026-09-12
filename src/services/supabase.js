import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing — check .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export async function getTabletPin() {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'tablet_pin')
    .single()
  if (error) return '1234'
  return data.value
}

export async function updateTabletPin(newPin) {
  return supabase
    .from('config')
    .update({ value: newPin })
    .eq('key', 'tablet_pin')
}

export async function getProfiles() {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, color, is_familiar, is_menstruation')
    .order('username')
  return data || []
}

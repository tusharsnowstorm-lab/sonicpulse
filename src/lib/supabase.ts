import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export type Registration = {
  id: string
  full_name: string
  date_of_birth: string
  email: string
  phone: string
  instagram_handle: string
  nid_number: string
  nid_file_path: string
  ticket_tier: 'phase1' | 'phase2' | 'phase3'
  ticket_qty: number
  status: RegistrationStatus
  reference_code: string
  created_at: string
}

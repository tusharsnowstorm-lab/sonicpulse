import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('influencer_applications')
    .select('id, status')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'No application found for this email.' }, { status: 404 })
  }

  return NextResponse.json({ application: data })
}

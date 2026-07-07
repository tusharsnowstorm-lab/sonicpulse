import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase-server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function checkAdmin() {
  const user = await getUser()
  if (!user) return null
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) return null
  return user
}

function generateRefCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SP-'
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('influencer_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data })
}

export async function PATCH(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { applicationId, status, gender } = body

  if (!applicationId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = adminClient()

  // Gender-only update
  if (gender !== undefined) {
    if (!['male', 'female'].includes(gender)) return NextResponse.json({ error: 'Invalid gender' }, { status: 400 })
    const { error } = await supabase.from('influencer_applications').update({ gender }).eq('id', applicationId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Fetch the application
  const { data: app, error: fetchErr } = await supabase
    .from('influencer_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchErr || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  if (status === 'approved') {
    const refCode = generateRefCode()

    // Create a ticket record in user_tickets so gate QR flow works
    const { error: ticketErr } = await supabase.from('user_tickets').insert({
      full_name: app.full_name,
      user_email: app.email,
      phone: app.phone,
      nid_number: app.id_number,
      id_type: app.id_type,
      nid_file_path: app.nid_file_path ?? '',
      instagram_handle: app.instagram_handle,
      gender: app.gender ?? '',
      ticket_tier: 'influencer',
      status: 'approved',
      reference_code: refCode,
    })

    if (ticketErr) {
      console.error('ticket insert error', ticketErr)
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }

    // Update the application record
    await supabase
      .from('influencer_applications')
      .update({ status: 'approved', reference_code: refCode })
      .eq('id', applicationId)

    // Send approval email (fire and forget)
    import('@/lib/email').then(({ sendInfluencerApprovalEmail }) =>
      sendInfluencerApprovalEmail(app.email, app.full_name, refCode)
    ).catch(() => {})
  } else {
    await supabase
      .from('influencer_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId)
  }

  return NextResponse.json({ success: true })
}

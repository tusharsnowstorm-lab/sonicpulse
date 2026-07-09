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

export async function GET(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = adminClient()

  if (req.nextUrl.searchParams.get('source') === 'promotion') {
    const { data: apps, error } = await supabase
      .from('promotion_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const userIds = Array.from(new Set((apps ?? []).map((a) => a.user_id)))
    // .in() with an empty array is rejected by PostgREST — fall back to a
    // value that matches nothing rather than skip the filter.
    const idFilter = userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']

    const [{ data: profiles }, { data: influencerProfiles }, { data: existingTickets }] = await Promise.all([
      supabase.from('user_profiles').select('user_id, full_name, phone, instagram_handle').in('user_id', idFilter),
      supabase.from('influencer_profiles').select('user_id, primary_platform, follower_count, content_type').in('user_id', idFilter),
      supabase.from('user_tickets').select('user_id').in('user_id', idFilter).neq('ticket_tier', 'influencer'),
    ])

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]))
    const influencerMap = new Map((influencerProfiles ?? []).map((p) => [p.user_id, p]))
    const ticketedUserIds = new Set((existingTickets ?? []).map((t) => t.user_id))

    const joined = (apps ?? []).map((app) => {
      const profile = profileMap.get(app.user_id)
      const inf = influencerMap.get(app.user_id)
      return {
        id: app.id,
        user_id: app.user_id,
        event_id: app.event_id,
        status: app.status,
        reference_code: app.reference_code,
        created_at: app.created_at,
        full_name: profile?.full_name ?? '(profile incomplete)',
        phone: profile?.phone ?? '',
        instagram_handle: profile?.instagram_handle ?? '',
        primary_platform: inf?.primary_platform ?? 'instagram',
        follower_count: inf?.follower_count ?? '',
        content_type: inf?.content_type ?? '',
        already_has_ticket: ticketedUserIds.has(app.user_id),
      }
    })

    return NextResponse.json({ applications: joined })
  }

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

  const { applicationId, status, source } = await req.json()
  if (!applicationId || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = adminClient()

  if (source === 'promotion') {
    const { data: app, error: fetchErr } = await supabase
      .from('promotion_applications')
      .select('*')
      .eq('id', applicationId)
      .single()
    if (fetchErr || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    if (status === 'approved') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, phone, nid_number, nid_file_path')
        .eq('user_id', app.user_id)
        .maybeSingle()
      if (!profile?.nid_file_path || !profile.full_name || !profile.phone || !profile.nid_number) {
        return NextResponse.json(
          { error: 'Applicant profile is missing required fields (name/phone/NID/ID document).' },
          { status: 400 }
        )
      }

      const refCode = generateRefCode()
      const { data: authUser } = await supabase.auth.admin.getUserById(app.user_id)

      const { error: ticketErr } = await supabase.from('user_tickets').insert({
        user_id: app.user_id,
        user_email: authUser?.user?.email ?? '',
        full_name: profile.full_name,
        phone: profile.phone,
        nid_number: profile.nid_number,
        nid_file_path: profile.nid_file_path,
        ticket_tier: 'influencer',
        status: 'approved',
        reference_code: refCode,
      })
      if (ticketErr) {
        console.error('promotion ticket insert error', ticketErr)
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
      }

      await supabase
        .from('promotion_applications')
        .update({ status: 'approved', reference_code: refCode })
        .eq('id', applicationId)
    } else {
      await supabase.from('promotion_applications').update({ status: 'rejected' }).eq('id', applicationId)
    }

    return NextResponse.json({ success: true })
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

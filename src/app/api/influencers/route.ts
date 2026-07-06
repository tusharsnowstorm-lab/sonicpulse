import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    full_name, email, phone, id_type, id_number,
    instagram_handle, tiktok_handle, youtube_channel,
    primary_platform, follower_count, content_type, message,
  } = body

  if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !id_number?.trim() || !instagram_handle?.trim() || !follower_count || !content_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const emailLower = email.trim().toLowerCase()

  const supabase = adminClient()

  // Check for duplicate application
  const { data: existing } = await supabase
    .from('influencer_applications')
    .select('id')
    .eq('email', emailLower)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 })
  }

  const { error } = await supabase.from('influencer_applications').insert({
    full_name: full_name.trim(),
    email: emailLower,
    phone: phone.trim(),
    id_type: id_type ?? 'nid',
    id_number: id_number.trim(),
    instagram_handle: instagram_handle.trim().replace('@', ''),
    tiktok_handle: tiktok_handle?.trim().replace('@', '') || null,
    youtube_channel: youtube_channel?.trim() || null,
    primary_platform,
    follower_count,
    content_type,
    message: message?.trim() || null,
    status: 'pending',
  })

  if (error) {
    console.error('influencer insert error', error)
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
  }

  // Send acknowledgement email (fire and forget)
  import('@/lib/email').then(({ sendInfluencerReceivedEmail }) =>
    sendInfluencerReceivedEmail(emailLower, full_name.trim())
  ).catch(() => {})

  return NextResponse.json({ success: true })
}

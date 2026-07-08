import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const full_name       = (formData.get('full_name') as string | null)?.trim() ?? ''
  const email           = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''
  const phone           = (formData.get('phone') as string | null)?.trim() ?? ''
  const id_type         = (formData.get('id_type') as string | null) ?? 'nid'
  const id_number       = (formData.get('id_number') as string | null)?.trim() ?? ''
  const gender          = (formData.get('gender') as string | null) ?? ''
  const instagram_handle = (formData.get('instagram_handle') as string | null)?.trim().replace('@', '') ?? ''
  const tiktok_handle   = (formData.get('tiktok_handle') as string | null)?.trim().replace('@', '') || null
  const youtube_channel = (formData.get('youtube_channel') as string | null)?.trim() || null
  const primary_platform = (formData.get('primary_platform') as string | null) ?? 'instagram'
  const follower_count  = (formData.get('follower_count') as string | null) ?? ''
  const content_type    = (formData.get('content_type') as string | null) ?? ''
  const idFile          = formData.get('id_file') as File | null
  const profilePicFile  = formData.get('profile_pic') as File | null
  const shuttle         = formData.get('shuttle') === 'yes'

  if (!full_name || !email || !phone || !id_number || !gender || !instagram_handle || !follower_count || !content_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!['male', 'female'].includes(gender)) {
    return NextResponse.json({ error: 'Invalid gender value.' }, { status: 400 })
  }
  if (!profilePicFile || profilePicFile.size === 0) {
    return NextResponse.json({ error: 'Profile photo is required.' }, { status: 400 })
  }
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedImageTypes.includes(profilePicFile.type)) {
    return NextResponse.json({ error: 'Profile photo must be JPG, PNG, or WebP.' }, { status: 400 })
  }
  if (profilePicFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Profile photo must be under 5MB.' }, { status: 400 })
  }
  if (!idFile || idFile.size === 0) {
    return NextResponse.json({ error: 'ID document upload is required.' }, { status: 400 })
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  if (!allowedTypes.includes(idFile.type)) {
    return NextResponse.json({ error: 'ID file must be JPG, PNG, or PDF.' }, { status: 400 })
  }
  if (idFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'ID file must be under 5MB.' }, { status: 400 })
  }

  const supabase = adminClient()

  // Check for duplicate application
  const { data: existing } = await supabase
    .from('influencer_applications')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 })
  }

  // Upload profile picture
  const picExt = profilePicFile.name.split('.').pop()
  const picFileName = `influencer/profile-${Date.now()}-${Math.random().toString(36).slice(2)}.${picExt}`
  const picBuffer = await profilePicFile.arrayBuffer()
  const { error: picUploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(picFileName, picBuffer, { contentType: profilePicFile.type, upsert: false })

  if (picUploadError) {
    console.error('influencer profile pic upload error', picUploadError)
    return NextResponse.json({ error: 'Failed to upload profile photo.' }, { status: 500 })
  }

  // Upload ID document to Supabase Storage
  const ext = idFile.name.split('.').pop()
  const fileName = `influencer/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await idFile.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('nid-documents')
    .upload(fileName, arrayBuffer, { contentType: idFile.type, upsert: false })

  if (uploadError) {
    console.error('influencer upload error', uploadError)
    // Clean up profile pic if ID upload fails
    await supabase.storage.from('profile-pictures').remove([picFileName])
    return NextResponse.json({ error: 'Failed to upload ID document.' }, { status: 500 })
  }

  const { error } = await supabase.from('influencer_applications').insert({
    full_name,
    email,
    phone,
    id_type,
    id_number,
    gender,
    instagram_handle,
    tiktok_handle,
    youtube_channel,
    primary_platform,
    follower_count,
    content_type,
    nid_file_path: fileName,
    profile_picture_path: picFileName,
    shuttle,
    status: 'pending',
  })

  if (error) {
    console.error('influencer insert error', error)
    // Clean up uploaded files if DB insert fails
    await supabase.storage.from('nid-documents').remove([fileName])
    await supabase.storage.from('profile-pictures').remove([picFileName])
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
  }

  // Send acknowledgement email (fire and forget)
  import('@/lib/email').then(({ sendInfluencerReceivedEmail }) =>
    sendInfluencerReceivedEmail(email, full_name)
  ).catch(() => {})

  return NextResponse.json({ success: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getUser } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const serviceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data ?? null })
}

export async function PUT(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = serviceClient()
  const formData = await req.formData()

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const nidNumber = formData.get('nidNumber') as string
  const instagramHandle = formData.get('instagramHandle') as string | null
  const otherSocial = formData.get('otherSocial') as string | null
  const gender = formData.get('gender') as string | null
  const idType = formData.get('idType') as string | null
  const nidFile = formData.get('nidFile') as File | null
  const profilePicFile = formData.get('profilePicFile') as File | null

  let nidFilePath: string | undefined
  let profilePicPath: string | undefined

  if (nidFile && nidFile.size > 0) {
    const ext = nidFile.name.split('.').pop()
    const path = `profiles/${user.id}/nid.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('nid-documents')
      .upload(path, nidFile, { upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload ID file.' }, { status: 500 })
    }
    nidFilePath = path
  }

  if (profilePicFile && profilePicFile.size > 0) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(profilePicFile.type)) {
      return NextResponse.json({ error: 'Profile photo must be JPG, PNG, or WebP.' }, { status: 400 })
    }
    if (profilePicFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Profile photo must be under 5MB.' }, { status: 400 })
    }
    const ext = profilePicFile.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const arrayBuffer = await profilePicFile.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(path, arrayBuffer, { contentType: profilePicFile.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload profile photo.' }, { status: 500 })
    }
    profilePicPath = path
  }

  const updateData: Record<string, string> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }
  if (fullName) updateData.full_name = fullName
  if (phone) updateData.phone = phone
  if (nidNumber) updateData.nid_number = nidNumber
  if (instagramHandle !== null) updateData.instagram_handle = instagramHandle
  if (otherSocial !== null) updateData.other_social_handle = otherSocial
  if (gender) updateData.gender = gender
  if (idType) updateData.id_type = idType
  if (nidFilePath) updateData.nid_file_path = nidFilePath
  if (profilePicPath) updateData.profile_picture_path = profilePicPath

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(updateData, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profile: data })
}

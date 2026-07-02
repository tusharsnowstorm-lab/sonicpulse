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
  const gender = formData.get('gender') as string | null
  const idType = formData.get('idType') as string | null
  const nidFile = formData.get('nidFile') as File | null

  let nidFilePath: string | undefined

  if (nidFile && nidFile.size > 0) {
    const ext = nidFile.name.split('.').pop()
    const path = `profiles/${user.id}/nid.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('nid-documents')
      .upload(path, nidFile, { upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload NID file.' }, { status: 500 })
    }
    nidFilePath = path
  }

  const updateData: Record<string, string> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }
  if (fullName) updateData.full_name = fullName
  if (phone) updateData.phone = phone
  if (nidNumber) updateData.nid_number = nidNumber
  if (instagramHandle !== null) updateData.instagram_handle = instagramHandle
  if (gender) updateData.gender = gender
  if (idType) updateData.id_type = idType
  if (nidFilePath) updateData.nid_file_path = nidFilePath

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(updateData, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profile: data })
}

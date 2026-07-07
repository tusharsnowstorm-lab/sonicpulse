import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function validateId(id: string, type: string): boolean {
  if (type === 'nid') return /^\d{10}$/.test(id) || /^\d{17}$/.test(id)
  if (type === 'passport') return id.length >= 5 && id.length <= 20
  if (type === 'birth_certificate') return /^\d{8,20}$/.test(id)
  return false
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const applicationId   = formData.get('applicationId') as string
  const currentEmail    = (formData.get('currentEmail') as string | null)?.trim().toLowerCase() ?? ''
  const fullName        = (formData.get('fullName') as string | null)?.trim() ?? ''
  const phone           = (formData.get('phone') as string | null)?.trim() ?? ''
  const nidNumber       = (formData.get('nidNumber') as string | null)?.trim() ?? ''
  const idType          = (formData.get('idType') as string | null) ?? 'nid'
  const instagramHandle = (formData.get('instagramHandle') as string | null)?.replace(/^@/, '').trim() ?? ''
  const gender          = (formData.get('gender') as string | null) ?? ''
  const nidFile         = formData.get('nidFile') as File | null

  if (!applicationId || !currentEmail || !fullName || !phone || !nidNumber || !instagramHandle || !gender) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (!validateId(nidNumber, idType)) {
    return NextResponse.json({ error: 'Invalid ID number for the selected document type.' }, { status: 400 })
  }
  if (!nidFile || nidFile.size === 0) {
    return NextResponse.json({ error: 'ID document is required.' }, { status: 400 })
  }
  if (nidFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'ID file must be under 5MB.' }, { status: 400 })
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  if (!allowedTypes.includes(nidFile.type)) {
    return NextResponse.json({ error: 'ID file must be JPG, PNG, or PDF.' }, { status: 400 })
  }

  const supabase = serviceClient()

  // Verify application exists and email matches
  const { data: application, error: lookupError } = await supabase
    .from('influencer_applications')
    .select('id, email, status, nid_file_path')
    .eq('id', applicationId)
    .eq('email', currentEmail)
    .single()

  if (lookupError || !application) {
    return NextResponse.json({ error: 'Application not found or email does not match.' }, { status: 404 })
  }

  if (application.status === 'rejected') {
    return NextResponse.json({ error: 'Rejected applications cannot be transferred.' }, { status: 400 })
  }

  // Upload new ID document
  const ext = nidFile.name.split('.').pop()
  const fileName = `influencer/transfer-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await nidFile.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('nid-documents')
    .upload(fileName, arrayBuffer, { contentType: nidFile.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload ID document.' }, { status: 500 })
  }

  // Update application with new holder details, reset to pending
  const { error: updateError } = await supabase
    .from('influencer_applications')
    .update({
      full_name: fullName,
      phone,
      id_number: nidNumber,
      id_type: idType,
      instagram_handle: instagramHandle,
      gender,
      nid_file_path: fileName,
      status: 'pending',
    })
    .eq('id', applicationId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update application.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

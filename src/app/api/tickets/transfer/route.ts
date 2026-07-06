import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase-server'

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
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const ticketId        = formData.get('ticketId') as string
  const fullName        = formData.get('fullName') as string
  const phone           = formData.get('phone') as string
  const nidNumber       = formData.get('nidNumber') as string
  const idType          = (formData.get('idType') as string | null) ?? 'nid'
  const instagramHandle = (formData.get('instagramHandle') as string | null)?.replace(/^@/, '') ?? ''
  const gender          = formData.get('gender') as string
  const nidFile         = formData.get('nidFile') as File | null

  if (!ticketId || !fullName || !phone || !nidNumber || !instagramHandle || !gender) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (!validateId(nidNumber, idType)) {
    return NextResponse.json({ error: 'Invalid ID number for the selected document type.' }, { status: 400 })
  }
  if (!nidFile || nidFile.size === 0) {
    return NextResponse.json({ error: 'NID document is required.' }, { status: 400 })
  }
  if (nidFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'NID file must be under 5MB.' }, { status: 400 })
  }

  const supabase = serviceClient()

  // Verify ticket belongs to this user
  const { data: ticket, error: ticketError } = await supabase
    .from('user_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  if (ticket.status === 'rejected') {
    return NextResponse.json({ error: 'Rejected tickets cannot be transferred.' }, { status: 400 })
  }

  // Check new ID isn't already registered (unless it's the same as current holder's)
  if (nidNumber !== ticket.nid_number || idType !== (ticket.id_type ?? 'nid')) {
    const { data: existing } = await supabase
      .from('user_tickets')
      .select('id')
      .eq('nid_number', nidNumber)
      .eq('id_type', idType)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This ID is already registered for another ticket.' }, { status: 409 })
    }
  }

  // Upload new NID file
  const ext = nidFile.name.split('.').pop()
  const fileName = `${user.id}/transfer-${Date.now()}.${ext}`
  const arrayBuffer = await nidFile.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('nid-documents')
    .upload(fileName, arrayBuffer, { contentType: nidFile.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload NID document.' }, { status: 500 })
  }

  // Update the ticket with new holder info and reset to pending
  const { error: updateError } = await supabase
    .from('user_tickets')
    .update({
      full_name: fullName,
      phone,
      nid_number: nidNumber,
      id_type: idType,
      instagram_handle: instagramHandle,
      gender,
      nid_file_path: fileName,
      status: 'pending',
    })
    .eq('id', ticketId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update ticket.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

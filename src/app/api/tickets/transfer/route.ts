import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase-server'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function validateNid(nid: string): boolean {
  return /^\d{10}$/.test(nid) || /^\d{17}$/.test(nid)
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const ticketId       = formData.get('ticketId') as string
  const fullName       = formData.get('fullName') as string
  const phone          = formData.get('phone') as string
  const nidNumber      = formData.get('nidNumber') as string
  const instagramHandle = (formData.get('instagramHandle') as string | null)?.replace(/^@/, '') ?? ''
  const gender         = formData.get('gender') as string
  const nidFile        = formData.get('nidFile') as File | null

  if (!ticketId || !fullName || !phone || !nidNumber || !instagramHandle || !gender) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (!validateNid(nidNumber)) {
    return NextResponse.json({ error: 'NID must be 10 or 17 digits.' }, { status: 400 })
  }
  if (!nidFile || nidFile.size === 0) {
    return NextResponse.json({ error: 'NID document is required.' }, { status: 400 })
  }
  if (nidFile.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'NID file must be under 2MB.' }, { status: 400 })
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

  // Check new NID isn't already registered (unless it's the current holder's NID)
  if (nidNumber !== ticket.nid_number) {
    const { data: existing } = await supabase
      .from('user_tickets')
      .select('id')
      .eq('nid_number', nidNumber)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This NID is already registered for another ticket.' }, { status: 409 })
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

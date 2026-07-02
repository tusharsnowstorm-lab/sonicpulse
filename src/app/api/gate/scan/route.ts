import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase-server'
import { isGateStaff } from '@/lib/gate-auth'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user || !isGateStaff(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ticketId, scanType } = await req.json()
  if (!ticketId || !['entry', 'exit'].includes(scanType)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const supabase = serviceClient()

  // Verify ticket exists and is approved
  const { data: ticket } = await supabase
    .from('user_tickets')
    .select('id, status')
    .eq('id', ticketId)
    .single()

  if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  if (ticket.status !== 'approved') {
    return NextResponse.json({ error: 'Ticket is not approved.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('ticket_scans')
    .insert({
      ticket_id: ticketId,
      scan_type: scanType,
      scanned_by: user.email,
    })

  if (error) return NextResponse.json({ error: 'Failed to record scan.' }, { status: 500 })

  return NextResponse.json({ success: true })
}

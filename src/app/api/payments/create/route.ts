import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser, getUserFromBearerToken } from '@/lib/supabase-server'
import { createPayment as bkashCreatePayment } from '@/lib/payments/bkash'
import { createSession as sslcommerzCreateSession } from '@/lib/payments/sslcommerz'

// Deliberately duplicated from mobile/data/event.ts — the server is
// authoritative and must never trust a client-posted amount; the mobile
// app's copy stays for display only.
const TICKET_PRICE = 4500
const SHUTTLE_PRICE = 800

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  // Cookie session (browser) first, bearer token (mobile app) as fallback —
  // the mobile app has no cookie jar shared with this origin.
  const user = (await getUser()) ?? (await getUserFromBearerToken(req))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const kind = body?.kind
  const provider = body?.provider
  if (kind !== 'ticket' && kind !== 'reservation') {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
  }
  if (provider !== 'bkash' && provider !== 'sslcommerz') {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  const supabase = serviceClient()

  let amount: number
  let ticketId: string | null = null
  let reservationId: string | null = null
  let includesShuttle = false

  if (kind === 'ticket') {
    const { data: ticket, error } = await supabase
      .from('user_tickets')
      .select('id, status, includes_shuttle, full_name, phone')
      .eq('user_id', user.id)
      .eq('ticket_tier', 'phase1')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!ticket || ticket.status !== 'approved') {
      return NextResponse.json({ error: 'No approved ticket to pay for' }, { status: 400 })
    }
    const { data: existingPaid } = await supabase
      .from('payments')
      .select('id')
      .eq('ticket_id', ticket.id)
      .eq('status', 'success')
      .maybeSingle()
    if (existingPaid) return NextResponse.json({ error: 'Already paid' }, { status: 409 })

    ticketId = ticket.id
    includesShuttle = ticket.includes_shuttle
    amount = TICKET_PRICE + (includesShuttle ? SHUTTLE_PRICE : 0)
  } else {
    const { data: reservation, error } = await supabase
      .from('accommodation_reservations')
      .select('id, status, price')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!reservation) {
      return NextResponse.json({ error: 'No approved reservation to pay for' }, { status: 400 })
    }
    const { data: existingPaid } = await supabase
      .from('payments')
      .select('id')
      .eq('reservation_id', reservation.id)
      .eq('status', 'success')
      .maybeSingle()
    if (existingPaid) return NextResponse.json({ error: 'Already paid' }, { status: 409 })

    reservationId = reservation.id
    amount = reservation.price
  }

  const { data: paymentRow, error: insertErr } = await supabase
    .from('payments')
    .insert({
      ticket_id: ticketId,
      reservation_id: reservationId,
      user_id: user.id,
      provider,
      amount,
      includes_shuttle: includesShuttle,
      status: 'initiated',
    })
    .select('id')
    .single()
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  try {
    if (provider === 'bkash') {
      const { bkashURL, paymentID } = await bkashCreatePayment({
        paymentsRowId: paymentRow.id,
        userId: user.id,
        amount,
      })
      await supabase.from('payments').update({ raw_payload: { paymentID } }).eq('id', paymentRow.id)
      return NextResponse.json({ url: bkashURL, paymentId: paymentRow.id })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, phone')
      .eq('user_id', user.id)
      .maybeSingle()
    const { gatewayUrl } = await sslcommerzCreateSession({
      paymentsRowId: paymentRow.id,
      amount,
      customerName: profile?.full_name ?? 'Connect Attendee',
      customerEmail: user.email ?? '',
      customerPhone: profile?.phone ?? '',
    })
    return NextResponse.json({ url: gatewayUrl, paymentId: paymentRow.id })
  } catch (err) {
    await supabase.from('payments').update({ status: 'failed' }).eq('id', paymentRow.id)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Payment init failed' }, { status: 502 })
  }
}

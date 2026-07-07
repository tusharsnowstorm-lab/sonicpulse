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

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('user_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tickets: data })
}

export async function PATCH(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { ticketId, status, gender } = body

  if (!ticketId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = adminClient()

  // Gender-only update
  if (gender !== undefined) {
    if (!['male', 'female'].includes(gender)) return NextResponse.json({ error: 'Invalid gender' }, { status: 400 })
    const { error } = await supabase.from('user_tickets').update({ gender }).eq('id', ticketId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Fetch ticket details before update so we have name/email/tier for the email
  const { data: ticket } = await supabase
    .from('user_tickets')
    .select('full_name, user_email, ticket_tier, reference_code')
    .eq('id', ticketId)
    .single()

  const { error } = await supabase
    .from('user_tickets')
    .update({ status })
    .eq('id', ticketId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send approval email when ticket is approved
  if (status === 'approved' && ticket?.user_email) {
    import('@/lib/email').then(({ sendApprovalEmail }) =>
      sendApprovalEmail(
        ticket.user_email,
        ticket.full_name,
        ticket.ticket_tier,
        ticket.reference_code,
      )
    ).catch(() => {})
  }

  return NextResponse.json({ success: true })
}

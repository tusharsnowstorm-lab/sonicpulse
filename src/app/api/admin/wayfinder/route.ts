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
    .from('wayfinder_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // Table not created yet — return an empty list instead of failing the admin page.
    // PostgREST reports a missing table as PGRST205, not the raw Postgres 42P01.
    if (error.code === '42P01' || error.code === 'PGRST205') return NextResponse.json({ applications: [], notReady: true })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ applications: data })
}

export async function PATCH(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { applicationId, applicationIds, status, assignedShift } = await req.json()

  const ids: string[] = Array.isArray(applicationIds)
    ? applicationIds
    : applicationId ? [applicationId] : []

  if (ids.length === 0 || ids.length > 200 || ids.some((id) => typeof id !== 'string' || id === '')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const update: { status?: string; assigned_shift?: string | null } = {}

  if (status !== undefined) {
    if (!['pending', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    update.status = status
  }

  if (assignedShift !== undefined) {
    if (assignedShift !== null && !['dusk', 'dawn'].includes(assignedShift)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    update.assigned_shift = assignedShift
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = adminClient()
  const { error } = await supabase
    .from('wayfinder_applications')
    .update(update)
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

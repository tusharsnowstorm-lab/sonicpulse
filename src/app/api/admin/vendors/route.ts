import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase-server'
import { VENDOR_STATUSES, packageByCode } from '@/data/vendors'
import { sendVendorConfirmedEmail } from '@/lib/vendor-email'

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
    .from('vendor_applications')
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

  const { applicationId, status, countersignName, countersignDesignation, adminNote } = await req.json()

  if (!applicationId || typeof applicationId !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const update: {
    status?: string
    countersigned_by?: string
    countersigned_designation?: string
    confirmed_at?: string
    admin_note?: string | null
  } = {}

  if (status !== undefined) {
    if (!VENDOR_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    update.status = status

    if (status === 'confirmed') {
      const name = (countersignName ?? '').trim()
      const designation = (countersignDesignation ?? '').trim()
      if (!name || !designation) {
        return NextResponse.json({ error: 'Countersigner name and designation are required to confirm.' }, { status: 400 })
      }
      update.countersigned_by = name
      update.countersigned_designation = designation
      update.confirmed_at = new Date().toISOString()
    }
  }

  if (adminNote !== undefined) {
    update.admin_note = typeof adminNote === 'string' && adminNote.trim() ? adminNote.trim() : null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = adminClient()
  const { error } = await supabase
    .from('vendor_applications')
    .update(update)
    .eq('id', applicationId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'confirmed') {
    const { data: row, error: selectError } = await supabase
      .from('vendor_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (!selectError && row) {
      await sendVendorConfirmedEmail(row, packageByCode(row.package_code))
    }
  }

  return NextResponse.json({ success: true })
}

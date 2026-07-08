import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser, getUserFromBearerToken } from '@/lib/supabase-server'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Polled by the app while a checkout is in flight. Only ever reflects a
// server-verified gateway response — the app never renders "paid" from
// its own redirect handling.
export async function GET(req: NextRequest) {
  const user = (await getUser()) ?? (await getUserFromBearerToken(req))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('payments')
    .select('status, user_id')
    .eq('id', id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ status: data.status })
}

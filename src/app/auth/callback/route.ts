import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  // Sanitise: only allow relative paths to prevent open-redirect
  const safNext = next.startsWith('/') ? next : '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
    const { data: { user } } = await supabase.auth.getUser()
    const gateEmails = (process.env.GATE_STAFF_EMAILS ?? '')
      .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    if (user?.email && gateEmails.includes(user.email.toLowerCase())) {
      return NextResponse.redirect(new URL('/gate', request.url))
    }
  }

  return NextResponse.redirect(new URL(safNext, request.url))
}

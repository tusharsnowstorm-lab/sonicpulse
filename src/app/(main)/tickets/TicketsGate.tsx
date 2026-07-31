'use client'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { ticketTiers } from '@/data/tickets'
import { APPLE_SIGNIN_LIVE } from '@/data/auth'
import PageHeader from '@/components/ui/PageHeader'
import AppPromoBand from '@/components/ui/AppPromoBand'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.031 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702"/>
    </svg>
  )
}

export default function TicketsGate() {
  const supabase = createSupabaseBrowserClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
  }

  const handleAppleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow="25 September 2026" title="Choose your night" sub="Every tier includes both stages, all seventeen and a half hours." className="mb-10 text-center" />

      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 60 }}>
        {ticketTiers.map((tier) => (
          <div
            key={tier.id}
            style={{
              width: 240,
              background: 'var(--bg-elevated)',
              border: tier.highlight ? '1px solid var(--accent-soft)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: tier.highlight ? '48px 28px' : '38px 28px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: tier.highlight ? 'var(--accent-magenta)' : 'var(--text-label-muted)', marginBottom: 20, fontFamily: 'var(--font-montserrat)', fontWeight: 700 }}>
              {tier.label}
            </p>
            <p style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', fontFamily: 'var(--font-montserrat)', margin: 0 }}>
              ৳{tier.price.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: 'var(--accent-magenta)', marginTop: 8 }}>
              ৳{tier.appPrice.toLocaleString()} in the app
            </p>
            <ul style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 2.1, marginTop: 22, listStyle: 'none', padding: 0 }}>
              {tier.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-xl mx-auto text-center">
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-semibold transition-all duration-150 mb-4 cursor-pointer"
          style={{ background: '#fff', color: '#000', touchAction: 'manipulation' }}
        >
          <GoogleIcon />
          Sign up / Sign in with Google
        </button>

        {APPLE_SIGNIN_LIVE && (
          <button
            onClick={handleAppleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-semibold transition-all duration-150 mb-4 cursor-pointer"
            style={{ background: '#fff', color: '#000', touchAction: 'manipulation', marginTop: -6 }}
          >
            <AppleIcon />
            Continue with Apple
          </button>
        )}

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Already have an account?{' '}
          <button
            onClick={handleSignIn}
            className="underline underline-offset-2 cursor-pointer"
            style={{ color: 'var(--accent-magenta)' }}
          >
            Sign in
          </button>
          {' '}to go straight to your dashboard.
        </p>

        <div className="mt-10">
          <AppPromoBand />
        </div>

        <div
          className="mt-10 p-4 rounded-xl text-sm text-left"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)' }}
        >
          <strong style={{ color: '#fff' }}>How it works: </strong>
          Sign up → Register ticket with your NID → We review within 24h → Approved tickets can be downloaded with QR code.
        </div>
      </div>
    </div>
  )
}

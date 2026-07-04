'use client'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { ticketTiers, CURRENT_PHASE } from '@/data/tickets'
import Badge from '@/components/ui/Badge'

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

export default function TicketsGate() {
  const supabase = createSupabaseBrowserClient()
  const tier = ticketTiers.find((t) => t.id === CURRENT_PHASE)

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-16 md:py-24">
      <div className="max-w-xl mx-auto text-center">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo-badge.webp"
            alt="Sonic Pulse"
            width={72}
            height={72}
            className="rounded-full"
            style={{ border: '2px solid rgba(255,255,255,0.25)' }}
          />
        </div>

        {/* Heading */}
        <p
          className="text-[10px] tracking-[0.35em] uppercase mb-3"
          style={{ color: 'var(--accent-volt)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Sonic Pulse 2025
        </p>
        <h1
          className="text-4xl md:text-5xl font-black glow-heading mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          GET YOUR TICKETS
        </h1>
        <p className="text-base mb-10" style={{ color: 'rgba(240,240,248,0.65)' }}>
          Create a free account to register for tickets. Each ticket is reviewed
          individually — you&apos;ll be notified by email once approved.
        </p>

        {/* Current tier card */}
        {tier && (
          <div
            className="rounded-[4px] p-6 mb-8 text-left glow-border"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                {tier.badge && (
                  <div className="mb-2">
                    <Badge variant={tier.highlight ? 'tier-highlight' : 'tier-last'}>{tier.badge}</Badge>
                  </div>
                )}
                <p
                  className="text-[10px] tracking-[0.25em] uppercase"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                  {tier.label}
                </p>
              </div>
              <p
                className="text-3xl font-black"
                style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
              >
                ৳{tier.price.toLocaleString()}
                <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}> BDT</span>
              </p>
            </div>
            <ul className="space-y-1">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(240,240,248,0.6)' }}>
                  <span style={{ color: 'var(--accent-electric)' }}>—</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sign in CTA */}
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded px-5 py-4 text-sm font-bold transition-all duration-150 mb-4 cursor-pointer"
          style={{
            background: 'var(--accent-electric)',
            color: '#050508',
            letterSpacing: '0.05em',
          }}
        >
          <GoogleIcon />
          Sign up / Sign in with Google
        </button>

        <p className="text-xs" style={{ color: 'rgba(240,240,248,0.35)' }}>
          Already have an account?{' '}
          <button
            onClick={handleSignIn}
            className="underline underline-offset-2 cursor-pointer"
            style={{ color: 'var(--accent-electric)' }}
          >
            Sign in
          </button>
          {' '}to go straight to your dashboard.
        </p>

        {/* How it works */}
        <div
          className="mt-10 p-4 rounded-[4px] text-sm text-left"
          style={{ background: 'var(--bg-elevated)', borderLeft: '3px solid var(--accent-electric)', color: 'rgba(240,240,248,0.55)' }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>How it works: </strong>
          Sign up → Register ticket with your NID → We review within 24h → Approved tickets can be downloaded with QR code.
        </div>

        <p className="text-xs mt-6" style={{ color: 'rgba(240,240,248,0.3)' }}>
          25 September 2026 · Bashundhara Open Grounds, Dhaka
        </p>
      </div>
    </div>
  )
}

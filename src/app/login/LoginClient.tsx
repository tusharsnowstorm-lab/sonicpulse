'use client'
import { useState } from 'react'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

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

export default function LoginClient() {
  const supabase = createSupabaseBrowserClient()
  const [showGateLogin, setShowGateLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gateError, setGateError] = useState<string | null>(null)
  const [gateLoading, setGateLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleGateSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setGateError(null)
    setGateLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setGateLoading(false)
    if (error) {
      setGateError('Invalid email or password.')
      return
    }
    const gateEmails = (process.env.NEXT_PUBLIC_GATE_STAFF_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    const userEmail = data.user?.email?.toLowerCase() ?? ''
    window.location.href = gateEmails.includes(userEmail) ? '/gate' : '/dashboard'
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '10px 12px',
    width: '100%',
    fontSize: 16,
    outline: 'none',
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-void)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/images/logo-badge.webp"
            alt="Sonic Pulse"
            width={64}
            height={64}
            className="rounded-full mb-4"
            style={{ border: '2px solid rgba(255,255,255,0.3)' }}
          />
          <h1
            className="text-2xl font-black tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)' }}
          >
            SONIC <span style={{ color: 'var(--accent-magenta)' }}>PULSE</span>
          </h1>
          <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
            25 September 2026
          </p>
        </div>

        {/* Attendee login card */}
        <div
          className="rounded-lg p-8"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
            Sign in
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Create your account to register for tickets and manage your bookings.
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded px-4 py-3 text-sm font-semibold transition-all duration-150"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            By signing in you agree to our terms of service and privacy policy.
          </p>
        </div>

        {/* Gate staff login */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowGateLogin((v) => !v)}
            className="w-full text-xs py-2 transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em' }}
          >
            {showGateLogin ? '▲ Hide' : '▼ Gate staff login'}
          </button>

          {showGateLogin && (
            <form
              onSubmit={handleGateSignIn}
              className="mt-3 rounded-lg p-6 space-y-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--accent-volt)', fontFamily: 'var(--font-jetbrains-mono)' }}
              >
                Gate Staff Access
              </p>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains-mono)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="gate@sonicpulsefestival.com"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains-mono)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              {gateError && (
                <p className="text-xs" style={{ color: 'var(--accent-pulse)' }}>{gateError}</p>
              )}

              <button
                type="submit"
                disabled={gateLoading}
                className="w-full py-3 rounded text-sm font-bold transition-all cursor-pointer"
                style={{
                  background: 'var(--accent-volt)',
                  color: '#050508',
                  opacity: gateLoading ? 0.6 : 1,
                }}
              >
                {gateLoading ? 'Signing in…' : 'Sign in as Gate Staff'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { LogOut, Search, QrCode } from 'lucide-react'

export default function GateLanding({ email }: { email: string }) {
  const [code, setCode] = useState('')
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    const ref = code.trim().toUpperCase()
    if (ref) router.push(`/verify/${ref}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo-badge.webp" alt="Sonic Pulse" width={30} height={30} className="rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.3)' }} />
            <span className="font-black tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)' }}>SONIC PULSE</span>
            <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(204,255,0,0.12)', border: '1px solid rgba(204,255,0,0.3)', color: 'var(--accent-volt)', fontFamily: 'var(--font-jetbrains-mono)' }}>
              GATE
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-10 space-y-8">
        {/* Status */}
        <div
          className="rounded-lg px-5 py-4 flex items-center gap-3"
          style={{ background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)' }}
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent-volt)', boxShadow: '0 0 6px var(--accent-volt)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--accent-volt)' }}>Gate access active</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Signed in as {email}</p>
          </div>
        </div>

        {/* QR instructions */}
        <div className="rounded-lg p-6 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <QrCode size={16} style={{ color: 'var(--accent-electric)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>Scanning tickets</p>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Use your phone camera to scan the QR code on an attendee&apos;s ticket. This opens the verification page automatically.
          </p>
          <ol className="text-sm space-y-1.5 list-none">
            {[
              'Open your phone camera and point it at the QR code.',
              'Tap the link that appears — the verify page opens in this browser.',
              'Check the photo and ID match the person in front of you.',
              'Press Confirm Entry / Confirm Exit as appropriate.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(0,240,255,0.12)', color: 'var(--accent-electric)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {i + 1}
                </span>
                <span style={{ color: 'rgba(240,240,248,0.75)' }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Manual lookup */}
        <div className="rounded-lg p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Search size={16} style={{ color: 'var(--accent-electric)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>Manual lookup</p>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            If the QR code is damaged or unreadable, enter the reference code manually.
          </p>
          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SP-XXXXXXXX"
              maxLength={11}
              style={{
                flex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                padding: '10px 12px',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'var(--font-jetbrains-mono)',
                letterSpacing: '0.1em',
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded text-sm font-bold cursor-pointer"
              style={{ background: 'var(--accent-electric)', color: '#050508' }}
            >
              Look up
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { LogOut, Search, Camera } from 'lucide-react'
import dynamic from 'next/dynamic'

const QrScanner = dynamic(() => import('@/components/gate/QrScanner'), { ssr: false })

export default function GateLanding({ email }: { email: string }) {
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
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
    <main className="min-h-screen" style={{ background: '#000' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.32em', fontFamily: 'var(--font-montserrat)', color: '#fff' }}>SONIC PULSE</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-faint)', border: '1px solid var(--accent-soft)', color: 'var(--accent-magenta)', fontFamily: 'var(--font-montserrat)', fontWeight: 700 }}>
              GATE
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.65)', border: '1px solid var(--border-strong)', fontFamily: 'var(--font-montserrat)', touchAction: 'manipulation' }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>

      {scanning && <QrScanner onClose={() => setScanning(false)} />}

      <div className="max-w-[600px] mx-auto px-4 py-10 space-y-8">
        {/* Status */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{ background: 'var(--accent-faint)', border: '1px solid var(--accent-soft)' }}
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent-magenta)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--accent-magenta)' }}>Gate access active</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Signed in as {email}</p>
          </div>
        </div>

        {/* Scan button */}
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl py-10"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent-soft)',
            touchAction: 'manipulation',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-faint)', border: '1.5px solid var(--accent-soft)' }}
          >
            <Camera size={28} style={{ color: 'var(--accent-magenta)' }} />
          </div>
          <div className="text-center">
            <p className="font-bold text-base" style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}>
              Scan QR code
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Tap to open camera and scan attendee ticket
            </p>
          </div>
        </button>

        {/* Manual lookup */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Search size={16} style={{ color: 'var(--accent-magenta)' }} />
            <p className="text-sm font-bold" style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}>Manual lookup</p>
          </div>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
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
                borderRadius: 12,
                color: '#fff',
                padding: '10px 12px',
                fontSize: 16,
                outline: 'none',
                fontFamily: 'var(--font-montserrat)',
                letterSpacing: '0.1em',
                WebkitAppearance: 'none',
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer"
              style={{ background: 'var(--accent-magenta)', color: '#fff', touchAction: 'manipulation' }}
            >
              Look up
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

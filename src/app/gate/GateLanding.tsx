'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
    <main className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo-badge.webp" alt="Sonic Pulse" width={30} height={30} className="rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.3)' }} />
            <span className="font-black tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)' }}>SONIC <span style={{ color: 'var(--accent-magenta)' }}>PULSE</span></span>
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

      {scanning && <QrScanner onClose={() => setScanning(false)} />}

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

        {/* Scan button */}
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-lg py-10"
          style={{
            background: 'rgba(0,240,255,0.06)',
            border: '2px solid rgba(0,240,255,0.3)',
            touchAction: 'manipulation',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,240,255,0.12)', border: '1.5px solid rgba(0,240,255,0.4)' }}
          >
            <Camera size={28} style={{ color: 'var(--accent-electric)' }} />
          </div>
          <div className="text-center">
            <p className="font-bold text-base" style={{ color: 'var(--accent-electric)', fontFamily: 'var(--font-space-grotesk)' }}>
              Scan QR Code
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Tap to open camera and scan attendee ticket
            </p>
          </div>
        </button>

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
                fontSize: 16,
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

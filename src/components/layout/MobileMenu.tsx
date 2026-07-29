'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X, User } from 'lucide-react'
import PillButton, { PillLink } from '@/components/ui/PillButton'
import { TICKETS_LIVE } from '@/data/tickets'

const navLinks = [
  { href: '/lineup', label: 'Lineup' },
  { href: '/activities', label: 'Activities' },
  { href: '/echoes', label: 'Echoes' },
  ...(TICKETS_LIVE ? [{ href: '/tickets', label: 'Tickets' }] : []),
  { href: '/first-pulse', label: 'First Pulse' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

type AuthUser = { id?: string; email?: string; user_metadata?: { avatar_url?: string } }
type Props = { onClose: () => void }

export default function MobileMenu({ onClose }: Props) {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return

    import('@/lib/supabase-browser').then(({ createSupabaseBrowserClient }) => {
      const supabase = createSupabaseBrowserClient()
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user)
        if (data.user?.id) {
          supabase
            .from('user_profiles')
            .select('profile_picture_path')
            .eq('user_id', data.user.id)
            .maybeSingle()
            .then(({ data: p }) => {
              if (p?.profile_picture_path) {
                setProfilePicUrl(`${url}/storage/v1/object/public/profile-pictures/${p.profile_picture_path}`)
              }
            })
        }
      })
    }).catch(() => {})
  }, [])

  const avatar = profilePicUrl ?? user?.user_metadata?.avatar_url ?? null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: '#000',
        overscrollBehavior: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{ height: '4rem', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
          <Image src="/images/brand/logo.webp" alt="" width={28} height={28} style={{ borderRadius: '50%' }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.32em', fontFamily: 'var(--font-montserrat)', color: '#fff' }}>
            SONIC PULSE
          </span>
        </Link>
        <button
          onClick={onClose}
          type="button"
          className="flex items-center justify-center"
          style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.6)', touchAction: 'manipulation' }}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col justify-center px-6 overflow-y-auto" aria-label="Mobile navigation">
        {navLinks.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center py-3"
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 'clamp(1.25rem, 5.5vw, 1.75rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: active ? 'var(--accent-magenta)' : '#fff',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom CTAs */}
      <div className="px-6 py-8 shrink-0 space-y-3">
        {user ? (
          <PillLink href="/dashboard" onClick={onClose} variant="outline" className="w-full">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Profile" width={20} height={20} style={{ borderRadius: '50%', objectFit: 'cover', width: 20, height: 20 }} />
            ) : (
              <User size={16} />
            )}
            Account
          </PillLink>
        ) : (
          <PillLink href="/login" onClick={onClose} variant="outline" className="w-full">
            <User size={16} />
            Sign in
          </PillLink>
        )}

        {TICKETS_LIVE && (
          <PillButton onClick={() => { onClose(); window.location.href = '/tickets' }} variant="primary" className="w-full">
            Get tickets
          </PillButton>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
          25 Sep 2026
        </p>
      </div>
    </div>
  )
}

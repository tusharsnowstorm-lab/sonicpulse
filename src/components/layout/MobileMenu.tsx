'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X, User } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/lineup', label: 'Lineup' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/faq', label: 'FAQ' },
  { href: '/policy', label: 'Policy' },
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
        backgroundImage: 'url(/images/hero-poster.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        overscrollBehavior: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(5,5,8,0.88)' }} aria-hidden="true" />

      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-5 shrink-0"
        style={{ height: '4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo-badge.webp"
            alt="Sonic Pulse"
            width={32}
            height={32}
            className="rounded-full"
            style={{ border: '1.5px solid rgba(255,255,255,0.35)' }}
          />
          <span
            className="text-lg font-black tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)' }}
          >
            SONIC <span style={{ color: 'var(--accent-magenta)' }}>PULSE</span>
          </span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="flex items-center justify-center"
          style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.7)', touchAction: 'manipulation' }}
          aria-label="Close menu"
        >
          <X size={26} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="relative z-10 flex-1 flex flex-col justify-center px-6 gap-1" aria-label="Mobile navigation">
        {navLinks.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center py-4 transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: 'clamp(1.35rem, 5.5vw, 1.75rem)',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: active ? 'var(--accent-electric)' : 'rgba(255,255,255,0.85)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {active && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-3 shrink-0"
                  style={{ background: 'var(--accent-electric)', marginBottom: 2 }}
                />
              )}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom CTAs */}
      <div className="relative z-10 px-6 py-8 shrink-0 space-y-3">
        {/* Auth button */}
        {user ? (
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center justify-center gap-3 w-full py-4 rounded font-bold tracking-widest uppercase"
            style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1.5px solid rgba(0,240,255,0.35)',
              color: 'var(--accent-electric)',
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '0.9rem',
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Profile" width={26} height={26} style={{ borderRadius: '50%', objectFit: 'cover', width: 26, height: 26 }} />
            ) : (
              <User size={18} />
            )}
            My Account
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-4 rounded font-bold tracking-widest uppercase"
            style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1.5px solid rgba(0,240,255,0.35)',
              color: 'var(--accent-electric)',
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '0.9rem',
            }}
          >
            <User size={18} />
            Sign In
          </Link>
        )}

        {/* Get tickets */}
        <Link
          href="/tickets"
          onClick={onClose}
          className="flex items-center justify-center w-full py-4 rounded font-bold tracking-widest uppercase"
          style={{
            background: 'var(--accent-electric)',
            color: '#050508',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '1rem',
          }}
        >
          GET TICKETS
        </Link>

        <p
          className="text-center text-xs mt-1 tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          25 Sep 2026 · Dhaka
        </p>
      </div>
    </div>
  )
}

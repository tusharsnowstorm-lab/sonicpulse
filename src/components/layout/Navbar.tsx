'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, User } from 'lucide-react'
import MobileMenu from './MobileMenu'
import { PillLink } from '@/components/ui/PillButton'

// Auth state is optional — if Supabase env vars aren't configured yet the
// navbar still renders and the hamburger button still works.
type AuthUser = { id?: string; email?: string; user_metadata?: { avatar_url?: string; full_name?: string } }

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  const fetchProfilePic = async (supabase: Awaited<ReturnType<typeof import('@/lib/supabase-browser')['createSupabaseBrowserClient']>>, userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('profile_picture_path')
      .eq('user_id', userId)
      .maybeSingle()
    if (data?.profile_picture_path) {
      setProfilePicUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${data.profile_picture_path}`)
    } else {
      setProfilePicUrl(null)
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return

    let unsubscribe: (() => void) | undefined
    import('@/lib/supabase-browser')
      .then(({ createSupabaseBrowserClient }) => {
        const supabase = createSupabaseBrowserClient()
        supabase.auth.getUser().then(({ data }: { data: { user: AuthUser | null } }) => {
          setUser(data.user)
          if (data.user?.id) fetchProfilePic(supabase, data.user.id)
        })
        const { data: listener } = supabase.auth.onAuthStateChange(
          (_: string, session: { user: AuthUser } | null) => {
            setUser(session?.user ?? null)
            if (session?.user?.id) fetchProfilePic(supabase, session.user.id)
            else setProfilePicUrl(null)
          }
        )
        unsubscribe = () => listener.subscription.unsubscribe()
      })
      .catch(() => {})

    return () => { unsubscribe?.() }
  }, [])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          background: scrolled ? 'rgba(0,0,0,0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          paddingTop: 'env(safe-area-inset-top)',
          transition: 'background 0.25s ease, border-color 0.25s ease',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <span
              style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.32em', fontFamily: 'var(--font-montserrat)', color: '#fff' }}
            >
              SONIC PULSE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontSize: 12.5,
                    color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                    fontFamily: 'var(--font-montserrat)',
                  }}
                >
                  {label}
                </Link>
              )
            })}
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
                style={{ fontSize: 12.5, color: '#fff', fontFamily: 'var(--font-montserrat)' }}
              >
                {profilePicUrl ?? user.user_metadata?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePicUrl ?? user.user_metadata!.avatar_url!} alt="Account" width={20} height={20} className="rounded-full" style={{ objectFit: 'cover', width: 20, height: 20 }} />
                ) : (
                  <User size={14} />
                )}
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                style={{ fontSize: 12.5, color: '#fff', fontFamily: 'var(--font-montserrat)' }}
              >
                Sign in
              </Link>
            )}
            <PillLink href="/tickets" variant="primary" style={{ padding: '10px 24px', fontSize: 12.5 }}>
              Get tickets
            </PillLink>
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex items-center justify-center"
            style={{ width: 48, height: 48, color: '#fff', flexShrink: 0, touchAction: 'manipulation' }}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Reserves nav height on non-hero pages. The home hero pulls itself up
          behind the nav with a negative margin instead of removing this. */}
      <div style={{ height: 'calc(4rem + env(safe-area-inset-top))' }} aria-hidden="true" />

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}

const navLinks = [
  { href: '/lineup', label: 'Lineup' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

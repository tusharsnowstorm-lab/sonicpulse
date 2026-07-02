'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, User } from 'lucide-react'
import MobileMenu from './MobileMenu'
import Button from '@/components/ui/Button'

// Auth state is optional — if Supabase env vars aren't configured yet the
// navbar still renders and the hamburger button still works.
type AuthUser = { id?: string; email?: string; user_metadata?: { avatar_url?: string; full_name?: string } }

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)

  const fetchProfilePic = async (supabase: Awaited<ReturnType<typeof import('@/lib/supabase-browser')['createSupabaseBrowserClient']>>, userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('profile_picture_path')
      .eq('id', userId)
      .maybeSingle()
    if (data?.profile_picture_path) {
      setProfilePicUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${data.profile_picture_path}`)
    } else {
      setProfilePicUrl(null)
    }
  }

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
        className="fixed top-0 left-0 right-0 z-40 h-16"
        style={{
          background: 'rgba(5,5,8,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2.5">
            <Image
              src="/images/logo-badge.webp"
              alt="Sonic Pulse"
              width={36}
              height={36}
              className="rounded-full"
              style={{ border: '1.5px solid rgba(255,255,255,0.35)' }}
            />
            <span
              className="text-lg font-black tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)' }}
            >
              SONIC PULSE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium transition-colors duration-150 pb-0.5"
                  style={{
                    color: active ? 'var(--accent-electric)' : 'var(--text-muted)',
                    borderBottom: active ? '2px solid var(--accent-electric)' : '2px solid transparent',
                  }}
                >
                  {label}
                </Link>
              )
            })}
            <Link href="/tickets">
              <Button size="sm">Get Tickets</Button>
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded"
                style={{ color: 'var(--accent-electric)', border: '1px solid rgba(0,240,255,0.3)' }}
              >
                {profilePicUrl ?? user.user_metadata?.avatar_url ? (
                  <Image src={profilePicUrl ?? user.user_metadata!.avatar_url!} alt="Account" width={18} height={18} className="rounded-full" style={{ objectFit: 'cover' }} />
                ) : (
                  <User size={14} />
                )}
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs px-3 py-1.5 rounded"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex items-center justify-center"
            style={{ width: 48, height: 48, color: 'var(--text-primary)', flexShrink: 0, touchAction: 'manipulation' }}
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      <div className="h-16" aria-hidden="true" />

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/lineup', label: 'Lineup' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

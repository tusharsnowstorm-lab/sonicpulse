'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useEffect } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/lineup', label: 'Lineup' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

type Props = { onClose: () => void }

export default function MobileMenu({ onClose }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundImage: 'url(/images/hero-poster.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5,5,8,0.88)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-5 h-16 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
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
            style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)' }}
          >
            SONIC PULSE
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
                fontSize: 'clamp(1.75rem, 8vw, 2.5rem)',
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

      {/* Bottom CTA */}
      <div className="relative z-10 px-6 py-8 shrink-0">
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
          className="text-center text-xs mt-3 tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          15 Nov 2025 · Dhaka
        </p>
      </div>
    </div>
  )
}

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-4"
      style={{
        minHeight: '100svh',
        backgroundImage: 'url(/images/hero-poster.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
      aria-label="Sonic Pulse hero"
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            rgba(5,5,8,0.68) 0%,
            rgba(5,5,8,0.50) 40%,
            rgba(5,5,8,0.50) 60%,
            rgba(5,5,8,0.80) 100%
          )`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <p
          className="text-xs font-bold tracking-[0.35em] uppercase mb-6"
          style={{ color: 'var(--accent-volt)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Dhaka Music Festival Presents
        </p>

        <h1
          className="glow-heading font-black leading-none tracking-tighter mb-6"
          style={{
            fontSize: 'clamp(2rem, 8vw, 5.5rem)',
            fontFamily: 'var(--font-space-grotesk)',
            color: 'var(--text-primary)',
          }}
        >
          SONIC <span style={{ color: 'var(--accent-electric)' }}>PULSE</span>
        </h1>

        <div
          className="inline-block rounded-lg px-5 py-3 mb-10"
          style={{ background: 'rgba(5,5,8,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <p
            className="text-base md:text-lg font-medium tracking-widest uppercase mb-1"
            style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            25 September 2026 · Bashundhara Open Grounds, Dhaka
          </p>
          <p
            className="text-sm tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            1 Night · 17 Hours · 800+ Festival-Goers
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/tickets">
            <Button size="lg">GET TICKETS</Button>
          </Link>
          <Link
            href="/lineup"
            className="text-sm font-bold tracking-widest uppercase transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'var(--font-jetbrains-mono)', textShadow: '0 0 20px rgba(255,255,255,0.4)' }}
          >
            VIEW LINEUP ↓
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <ChevronDown size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
      </div>
    </section>
  )
}

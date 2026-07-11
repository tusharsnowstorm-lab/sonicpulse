import Image from 'next/image'
import { PillLink } from '@/components/ui/PillButton'
import Eyebrow from '@/components/ui/Eyebrow'

export default function Hero() {
  return (
    <section
      className="relative flex flex-col justify-end overflow-hidden"
      style={{ minHeight: '100svh', marginTop: 'calc(-4rem - env(safe-area-inset-top))', paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}
      aria-label="Sonic Pulse hero"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-visual.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      {/* Bottom-heavy black gradient so the type stays dominant */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            rgba(0,0,0,0.65) 0%,
            rgba(0,0,0,0.45) 30%,
            rgba(0,0,0,0.7) 60%,
            rgba(0,0,0,0.98) 100%
          )`,
        }}
        aria-hidden="true"
      />
      {/* Left-side scrim — hero content sits bottom-left on desktop */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55), transparent 55%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 px-6vw text-center sm:text-left" style={{ padding: '0 6vw 90px' }}>
        <Eyebrow className="mb-6">25 September 2026 · Dhaka</Eyebrow>

        <h1
          style={{
            fontSize: 'var(--text-display)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.0,
            color: '#fff',
            fontFamily: 'var(--font-montserrat)',
          }}
        >
          One night.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>Seventeen hours.</span>
        </h1>

        <p
          style={{
            fontSize: 'var(--text-lede)',
            fontWeight: 500,
            color: 'var(--text-dim)',
            maxWidth: 440,
            margin: '30px 0 40px',
            lineHeight: 1.65,
          }}
          className="mx-auto sm:mx-0"
        >
          Bangladesh&apos;s first sunset-to-sunrise music festival. Two stages. Eight hundred people. No filler.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <PillLink href="/tickets" variant="primary">Get tickets</PillLink>
          <PillLink href="/lineup" variant="ghost">See the lineup →</PillLink>
        </div>
      </div>
    </section>
  )
}

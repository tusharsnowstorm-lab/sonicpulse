export default function HoldBackTheVoid() {
  return (
    <section
      className="relative py-28 md:py-40 text-center overflow-hidden"
      style={{
        backgroundImage: 'url(/images/poster-2.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-label="Hold Back the Void"
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5,5,8,0.72)' }}
        aria-hidden="true"
      />

      {/* Vertical beam decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(150,60,220,0.25), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <p
          className="text-xs font-bold tracking-[0.35em] uppercase mb-5"
          style={{ color: 'rgba(160,100,240,0.9)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          One Frequency. A Pulse of Pure Sound.
        </p>

        <h2
          className="font-black leading-none tracking-tighter mb-8"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontFamily: 'var(--font-space-grotesk)',
            color: 'var(--text-primary)',
          }}
        >
          HOLD{' '}
          <span style={{ color: 'var(--accent-pulse)' }}>BACK</span>
          {' '}THE{' '}
          <span style={{ color: 'var(--accent-magenta)' }}>VOID.</span>
        </h2>

        <p
          className="text-sm md:text-base leading-relaxed max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          The crowd creates the charge. The music guides the energy. Dance until
          the resonance channels upward — firing a laser of pure sound to keep the
          unknown at bay.
        </p>
      </div>
    </section>
  )
}

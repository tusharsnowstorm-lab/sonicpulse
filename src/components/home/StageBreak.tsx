import Image from 'next/image'

/** Full-bleed cinematic break between sections — one statement over one photo. */
export default function StageBreak() {
  return (
    <div style={{ position: 'relative', height: '62vh', minHeight: 380, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        src="/images/poster-2.webp"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #000 0%, transparent 22%, transparent 78%, #000 100%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 6vw' }}>
        <p
          style={{
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            maxWidth: 700,
            color: '#fff',
            fontFamily: 'var(--font-montserrat)',
            margin: '0 auto',
          }}
        >
          The biggest sound system ever assembled in Dhaka.
        </p>
        <span
          style={{
            display: 'block',
            fontSize: 12,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginTop: 22,
          }}
        >
          Main stage · 400,000 watts
        </span>
      </div>
    </div>
  )
}

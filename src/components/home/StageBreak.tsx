/** Full-bleed typographic break between sections — one statement, no imagery. */
export default function StageBreak() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '110px 6vw',
        textAlign: 'center',
      }}
    >
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
          color: 'var(--text-label-muted)',
          marginTop: 22,
        }}
      >
        Main stage · 400,000 watts
      </span>
    </div>
  )
}

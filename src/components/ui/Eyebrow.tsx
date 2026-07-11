type EyebrowProps = {
  children: React.ReactNode
  tone?: 'accent' | 'muted'
  className?: string
}

/** Small tracked uppercase label — hero eyebrows, section kickers, tier names. */
export default function Eyebrow({ children, tone = 'accent', className = '' }: EyebrowProps) {
  return (
    <p
      className={className}
      style={{
        fontSize: 'var(--text-label)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        fontWeight: 700,
        color: tone === 'accent' ? 'var(--accent-magenta)' : 'var(--text-label-muted)',
        fontFamily: 'var(--font-montserrat)',
      }}
    >
      {children}
    </p>
  )
}

import Eyebrow from './Eyebrow'

type SectionProps = {
  title?: string
  eyebrow?: string
  sub?: string
  children: React.ReactNode
  className?: string
  /** Reduce top/bottom padding — for sections stacked tightly (e.g. tiers under app band). */
  tight?: boolean
}

/** Centered content section — title/eyebrow/sub header, generous padding, black canvas. */
export default function Section({ title, eyebrow, sub, children, className = '', tight = false }: SectionProps) {
  return (
    <section
      className={className}
      style={{
        padding: tight ? '20px 6vw 110px' : '110px 6vw',
        textAlign: 'center',
      }}
    >
      {eyebrow && <Eyebrow tone="muted">{eyebrow}</Eyebrow>}
      {title && (
        <h2
          style={{
            fontSize: 'var(--text-title)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-montserrat)',
            marginTop: eyebrow ? 14 : 0,
            marginBottom: sub ? 14 : 44,
          }}
        >
          {title}
        </h2>
      )}
      {sub && (
        <p
          style={{
            fontSize: 'var(--text-lede)',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 60,
          }}
        >
          {sub}
        </p>
      )}
      {children}
    </section>
  )
}

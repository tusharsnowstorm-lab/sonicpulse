import Eyebrow from './Eyebrow'

type PageHeaderProps = {
  eyebrow: string
  title: string
  sub?: string
  className?: string
}

/** Standard page header used by every non-home public page — eyebrow, h1, optional sub-line. */
export default function PageHeader({ eyebrow, title, sub, className = 'mb-12' }: PageHeaderProps) {
  return (
    <div className={className}>
      <Eyebrow tone="muted">{eyebrow}</Eyebrow>
      <h1
        style={{
          fontSize: 'clamp(34px, 6vw, 56px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#fff',
          fontFamily: 'var(--font-montserrat)',
          marginTop: 14,
        }}
      >
        {title}
      </h1>
      {sub && (
        <p style={{ marginTop: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-dim)' }}>{sub}</p>
      )}
    </div>
  )
}

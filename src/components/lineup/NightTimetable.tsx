import Link from 'next/link'
import { timetableRows } from '@/data/lineup'

function Row({ row }: { row: (typeof timetableRows)[number] }) {
  const inner = (
    <div
      className="grid items-baseline"
      style={{
        gridTemplateColumns: '170px 1fr auto',
        gap: 18,
        padding: '15px 24px',
        background: row.ritual ? 'linear-gradient(90deg, var(--accent-faint), transparent 55%)' : 'transparent',
      }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', color: '#fff' }}>
        {row.time}
      </span>
      <span>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{row.name}</span>
        {row.sub && (
          <span style={{ display: 'block', fontWeight: 400, fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            {row.sub}
          </span>
        )}
      </span>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: row.ritual ? 'var(--accent-magenta)' : 'var(--text-label-muted)',
        }}
      >
        {row.tag}
      </span>
    </div>
  )

  if (!row.href) return inner
  return (
    <Link href={row.href} className="block" style={{ touchAction: 'manipulation' }}>
      {inner}
    </Link>
  )
}

export default function NightTimetable() {
  return (
    <>
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {timetableRows.map((row, i) => (
          <div key={row.time} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <Row row={row} />
          </div>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-label-muted)', lineHeight: 1.6 }}>
        One continuous night — the Main Stage runs until 4:30 AM, then the Sunrise Stage carries it through to 9:30 AM.
      </p>
    </>
  )
}

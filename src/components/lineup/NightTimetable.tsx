import Link from 'next/link'
import { timetableRows } from '@/data/lineup'

function Row({ row }: { row: (typeof timetableRows)[number] }) {
  const inner = (
    <div
      className="flex flex-wrap items-baseline gap-y-1 gap-x-[18px] px-4 py-[15px] sm:grid sm:px-6"
      style={{
        gridTemplateColumns: '170px 1fr auto',
        background: row.ritual ? 'linear-gradient(90deg, var(--accent-faint), transparent 55%)' : 'transparent',
      }}
    >
      <span className="order-1 sm:order-none" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', color: '#fff' }}>
        {row.time}
      </span>
      <span className="order-3 basis-full min-w-0 sm:order-none sm:basis-auto">
        <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{row.name}</span>
        {row.sub && (
          <span style={{ display: 'block', fontWeight: 400, fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            {row.sub}
          </span>
        )}
      </span>
      <span
        className="order-2 ml-auto whitespace-nowrap sm:order-none sm:ml-0"
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

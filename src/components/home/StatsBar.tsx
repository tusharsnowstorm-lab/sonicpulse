import { artists } from '@/data/artists'

const stats = [
  { value: '17', label: 'Hours' },
  { value: '2', label: 'Stages' },
  { value: String(artists.length), label: 'Artists' },
  { value: '800', label: 'Capacity' },
]

export default function StatsBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 70, padding: '64px 6vw', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
      {stats.map(({ value, label }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <b style={{ display: 'block', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', fontFamily: 'var(--font-montserrat)' }}>
            {value}
          </b>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

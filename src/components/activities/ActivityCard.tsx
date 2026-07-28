import Image from 'next/image'
import type { Activity } from '@/data/activities'

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16 / 11', overflow: 'hidden' }}>
        {activity.image ? (
          <Image
            src={activity.image}
            alt={activity.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            role="img"
            aria-label="Star field — no photo yet"
            style={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(1px 1px at 12% 30%, #fff 60%, transparent 61%),
                radial-gradient(1px 1px at 34% 62%, rgba(255,255,255,0.8) 60%, transparent 61%),
                radial-gradient(1.5px 1.5px at 58% 22%, #fff 60%, transparent 61%),
                radial-gradient(1px 1px at 71% 74%, rgba(255,255,255,0.7) 60%, transparent 61%),
                radial-gradient(1px 1px at 85% 42%, #fff 60%, transparent 61%),
                radial-gradient(1.6px 1.6px at 44% 84%, rgba(255,255,255,0.9) 60%, transparent 61%),
                radial-gradient(1px 1px at 22% 80%, rgba(255,255,255,0.65) 60%, transparent 61%),
                radial-gradient(1.2px 1.2px at 90% 12%, #fff 60%, transparent 61%),
                radial-gradient(1px 1px at 65% 54%, rgba(255,255,255,0.75) 60%, transparent 61%),
                radial-gradient(120% 100% at 50% 120%, rgba(163,79,255,0.3), transparent 60%),
                linear-gradient(180deg, #03020a, #0b0620)
              `,
            }}
          />
        )}
      </div>

      <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-magenta)', fontWeight: 700 }}>
          {activity.kicker}
        </span>
        <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.02em', color: '#fff' }}>
          {activity.name} <span style={{ color: 'var(--accent-magenta)', fontWeight: 600, fontSize: 15 }}>· {activity.tail}</span>
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>{activity.hook}</p>

        <details style={{ marginTop: 'auto' }}>
          <summary
            style={{
              listStyle: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              paddingTop: 8,
              touchAction: 'manipulation',
            }}
          >
            Read more
          </summary>
          <p style={{ color: 'var(--text-dim)', fontSize: 13.5, paddingTop: 8, lineHeight: 1.65 }}>{activity.extended}</p>
          {activity.caption && (
            <p style={{ fontSize: 11.5, color: 'var(--text-label-muted)', marginTop: 6 }}>{activity.caption}</p>
          )}
        </details>
      </div>
    </article>
  )
}

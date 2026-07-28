import Image from 'next/image'
import type { Echo } from '@/data/echoes'

export default function EchoPanel({ echo, reverse }: { echo: Echo; reverse?: boolean }) {
  return (
    <div
      className="grid md:grid-cols-2"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        marginTop: 26,
      }}
    >
      <div
        className={reverse ? 'md:order-2' : undefined}
        style={{ position: 'relative', minHeight: 300 }}
      >
        {echo.image ? (
          <Image
            src={echo.image}
            alt={`${echo.name} — ${echo.tail}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
            style={{
              padding: 30,
              background:
                'radial-gradient(80% 60% at 50% 100%, rgba(255,63,194,0.16), transparent 60%), radial-gradient(60% 45% at 50% 45%, rgba(163,79,255,0.32), transparent 65%), linear-gradient(180deg, #05030d, #0d0620)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 120,
                height: 62,
                border: '2px solid rgba(255,255,255,0.65)',
                borderBottom: 'none',
                borderRadius: '120px 120px 0 0',
                boxShadow: '0 0 34px rgba(255,63,194,0.5), inset 0 0 24px rgba(163,79,255,0.5)',
              }}
            />
            <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              No photo yet
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3" style={{ padding: '32px 36px' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--text-label-muted)', fontWeight: 700 }}>
          ECHO {echo.roman} · {echo.phase.toUpperCase()}
        </span>
        <h3 style={{ fontSize: 'clamp(22px, 2.6vw, 28px)', fontWeight: 800, letterSpacing: '0.02em', color: '#fff' }}>
          {echo.name} <span style={{ color: 'var(--accent-magenta)' }}>· {echo.tail}</span>
        </h3>
        <span style={{ fontSize: 11.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 600 }}>
          {echo.where}
        </span>
        <p style={{ color: 'var(--text-dim)', fontSize: 14.5, maxWidth: '54ch', lineHeight: 1.65 }}>{echo.lore}</p>
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--text-label-muted)',
            borderTop: '1px solid var(--border)',
            paddingTop: 12,
            marginTop: 6,
          }}
        >
          <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>On site: </span>
          {echo.onSite}
        </p>
      </div>
    </div>
  )
}

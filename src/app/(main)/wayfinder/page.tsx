import type { Metadata } from 'next'
import PageHeader from '@/components/ui/PageHeader'
import WayfinderForm from '@/components/wayfinder/WayfinderForm'
import { WAYFINDER_LIVE, wayfinderShifts } from '@/data/wayfinder'

export const metadata: Metadata = {
  title: 'Wayfinder — Sonic Pulse',
  description: 'Join the Wayfinder volunteer corps. Guide the night at Sonic Pulse 2026.',
}

const points = [
  {
    title: 'A certificate that counts',
    body: 'Every Wayfinder who completes a shift receives a certificate of service from Dhaka Music Festival — written for university applications.',
  },
  {
    title: 'Open to graduating students',
    body: 'Final-year undergraduates and HSC or A-level finishers, 17 or older, are welcome to apply.',
  },
  {
    title: 'Inside the whole night',
    body: 'Two stages, nine art installations, and the Great Burn at midnight — you are in the room for all of it.',
  },
]

export default function WayfinderPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow="Volunteer programme" title="Wayfinder" sub="Guide the night." />

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>What a Wayfinder does</h2>
          <p style={{ color: 'var(--text-dim)', maxWidth: '58ch', lineHeight: 1.7 }}>
            Eight hundred people walk into a field they have never seen before, in the dark, for seventeen
            and a half hours. Wayfinders are the reason none of them feel lost. You are the festival on the
            ground — the person who knows where the water is, which way the Sunrise Stage is, and what
            happens at midnight.
          </p>
          <p style={{ color: 'var(--text-dim)', maxWidth: '58ch', lineHeight: 1.7 }}>
            Fifty Wayfinders work the night in two shifts. Bring patience, a good sense of direction, and the
            willingness to answer the same question forty times without losing your warmth.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            {points.map((p) => (
              <div key={p.title} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                <span style={{ color: 'var(--accent-magenta)', fontWeight: 800 }}>→</span>
                <div>
                  <b style={{ display: 'block', fontWeight: 700, fontSize: 14.5, color: '#fff' }}>{p.title}</b>
                  <span style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>{p.body}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            {wayfinderShifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 14.5, fontWeight: 700, color: '#fff' }}>{shift.label}</b>
                  <span style={{ fontSize: 12.5, color: 'var(--accent-magenta)' }}>{shift.time}</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.6 }}>{shift.blurb}</p>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', marginTop: 10, fontWeight: 700 }}>
                  {shift.places} places
                </p>
              </div>
            ))}
          </div>
        </div>

        {WAYFINDER_LIVE ? (
          <WayfinderForm />
        ) : (
          <div
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 32, textAlign: 'center' }}
          >
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Wayfinder applications are closed.</p>
            <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>All fifty places are filled for 2026. Follow @sonicpulsefestival for the next call.</p>
          </div>
        )}
      </div>
    </div>
  )
}

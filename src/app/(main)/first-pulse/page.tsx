import type { Metadata } from 'next'
import PageHeader from '@/components/ui/PageHeader'
import FirstPulseForm from '@/components/first-pulse/FirstPulseForm'

export const metadata: Metadata = {
  title: 'First Pulse — Sonic Pulse',
  description: 'The open call for the next wave. Two artists open Sonic Pulse 2026.',
}

const points = [
  {
    title: 'A real slot, not a side tent',
    body: '4:00–7:00 PM on the main stage, full production.',
  },
  {
    title: 'The full treatment',
    body: "Your own cosmic-constellation poster and bio card, made like the headliners'.",
  },
  {
    title: 'Heard by the right ears',
    body: 'Sets reviewed by the Sonic Pulse artists; selected names announced on the event page.',
  },
]

export default function FirstPulsePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow="Open call" title="First Pulse" sub="The first signal of the Pulse." />

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Why we&apos;re doing this</h2>
          <p style={{ color: 'var(--text-dim)', maxWidth: '58ch', lineHeight: 1.7 }}>
            Every artist on our poster played to an empty room once. Somebody gave them a stage anyway. Sonic
            Pulse runs on the underground, and undergrounds only survive when the next wave gets a way in — so
            we&apos;re holding the door open ourselves. The call is open worldwide: if you can get to Dhaka on
            25 September, you can play.
          </p>
          <p style={{ color: 'var(--text-dim)', maxWidth: '58ch', lineHeight: 1.7 }}>
            Two artists from this open call will open Sonic Pulse 2026: a three-hour window, the main rig, eight
            hundred people arriving curious. Same stage as the headliners, same poster treatment, same sky.
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
        </div>

        <FirstPulseForm />
      </div>
    </div>
  )
}

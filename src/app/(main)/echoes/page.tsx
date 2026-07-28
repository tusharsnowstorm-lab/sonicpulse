import type { Metadata } from 'next'
import PageHeader from '@/components/ui/PageHeader'
import EchoPanel from '@/components/echoes/EchoPanel'
import { echoes } from '@/data/echoes'

export const metadata: Metadata = {
  title: 'The Nine Echoes — Sonic Pulse',
  description: 'Nine installations, one lore — gate to burn.',
}

export default function EchoesPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader
        eyebrow="Art installations"
        title="The Nine Echoes"
        sub="Nine installations, one lore — walk them all before sunrise."
      />

      <div
        style={{
          border: '1px solid var(--border)',
          background: 'radial-gradient(90% 120% at 85% -10%, rgba(163,79,255,0.14), transparent 55%), var(--bg-elevated)',
          borderRadius: 'var(--radius-card)',
          padding: '38px 40px',
          maxWidth: 860,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700 }}>
          The founding myth
        </span>
        <h2 style={{ margin: '10px 0 14px', fontSize: 24, fontWeight: 800, color: '#fff' }}>
          Before language, there was frequency.
        </h2>
        <p style={{ color: 'var(--text-dim)', maxWidth: '66ch', lineHeight: 1.7 }}>
          Long before this city had a name, something crossed the sky over the delta and fell into the wetlands.
          It didn&apos;t die. It scattered — into nine echoes that sank into the grass, the water and the trees,
          and waited. The glyphs you&apos;ll find burned into stone and steel across the grounds are its handwriting.
        </p>
        <p style={{ color: 'var(--text-dim)', maxWidth: '66ch', lineHeight: 1.7, marginTop: 14 }}>
          One night a year, when eight hundred heartbeats land in the same field, the echoes wake. For seventeen
          and a half hours this place remembers what it is: a landing ground. Walk all nine before sunrise and the
          Loop closes with you inside it.
        </p>
        <p style={{ color: '#fff', fontWeight: 600, marginTop: 14 }}>
          You don&apos;t attend Sonic Pulse. You&apos;re received by it.
        </p>
      </div>

      <div>
        {echoes.map((echo, i) => (
          <EchoPanel key={echo.id} echo={echo} reverse={i % 2 === 1} />
        ))}
      </div>

      <p style={{ marginTop: 30, fontSize: 13.5, color: 'var(--text-dim)', maxWidth: '70ch' }}>
        Enter the Loop (I), ride the tide (II), cross the horizon (III), walk the forest&apos;s dream (IV), meet
        the keeper (V), climb (VI), reign (VII), rest (VIII), release (IX). Nine stations, one arc — gate to burn.
      </p>
    </div>
  )
}

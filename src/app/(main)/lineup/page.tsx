import type { Metadata } from 'next'
import PageHeader from '@/components/ui/PageHeader'
import ArtistSlider from '@/components/lineup/ArtistSlider'
import NightTimetable from '@/components/lineup/NightTimetable'
import Eyebrow from '@/components/ui/Eyebrow'
import { ARTIST_COUNT } from '@/data/lineup'

export const metadata: Metadata = {
  title: 'Lineup — Sonic Pulse',
  description: `${ARTIST_COUNT} artists. One night, gate to sunrise.`,
}

export default function LineupPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader
        eyebrow="25 September 2026"
        title="The lineup"
        sub={`${ARTIST_COUNT} artists · One night, gate to sunrise`}
      />
      <ArtistSlider />

      <div style={{ marginTop: 70 }}>
        <Eyebrow tone="muted">The night, in order</Eyebrow>
        <div style={{ marginTop: 24 }}>
          <NightTimetable />
        </div>
      </div>
    </div>
  )
}

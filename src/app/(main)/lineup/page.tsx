import type { Metadata } from 'next'
import { artists } from '@/data/artists'
import ArtistGrid from '@/components/lineup/ArtistGrid'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Lineup — Sonic Pulse',
  description: `${artists.length} artists. Two stages. One night.`,
}

export default function LineupPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader
        eyebrow="25 September 2026"
        title="The lineup"
        sub={`${artists.length} artists · Two stages`}
      />
      <ArtistGrid />
    </div>
  )
}

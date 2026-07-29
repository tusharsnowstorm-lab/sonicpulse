import type { Metadata } from 'next'
import PageHeader from '@/components/ui/PageHeader'
import ActivityCard from '@/components/activities/ActivityCard'
import ConceptArtNote from '@/components/ui/ConceptArtNote'
import { activities } from '@/data/activities'
import { CONCEPT_ART_NOTE_LIVE } from '@/data/concept-art'

export const metadata: Metadata = {
  title: 'Activities — Sonic Pulse',
  description: 'Fire, water, light and food — the grounds are as much the show as the stage.',
}

export default function ActivitiesPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader
        eyebrow="Beyond the stage"
        title="The grounds are open"
        sub={`Nine rituals around the music — as much the show as the artists themselves.${CONCEPT_ART_NOTE_LIVE ? '*' : ''}`}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 20,
        }}
      >
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
      <ConceptArtNote />
    </div>
  )
}

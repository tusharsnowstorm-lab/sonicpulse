import Section from '@/components/ui/Section'
import PhotoCard from '@/components/ui/PhotoCard'
import Reveal from '@/components/ui/Reveal'
import { PillLink } from '@/components/ui/PillButton'
import { activities } from '@/data/activities'

const featured = activities.filter((a) => a.image).slice(0, 3)

export default function ActivitiesTeaser() {
  return (
    <Section eyebrow="Beyond the stage" title="The grounds are as much the show as the artists.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 4,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {featured.map((activity, i) => (
          <Reveal key={activity.id} delay={i * 80}>
            <PhotoCard
              src={activity.image!}
              alt={activity.name}
              title={`${activity.name} · ${activity.tail}`}
              caption={activity.hook}
              ratio="4/3"
              captionStyle="prose"
            />
          </Reveal>
        ))}
      </div>
      <PillLink href="/activities" variant="outline" style={{ marginTop: 44 }}>
        All nine activities →
      </PillLink>
    </Section>
  )
}

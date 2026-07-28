import { acts } from '@/data/lineup'
import Section from '@/components/ui/Section'
import PhotoCard from '@/components/ui/PhotoCard'
import Reveal from '@/components/ui/Reveal'
import { PillLink } from '@/components/ui/PillButton'

export default function ArtistTeaser() {
  const featured = acts.filter((a) => a.poster)

  return (
    <Section eyebrow="The lineup" title="One night. Gate to sunrise.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 4,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {featured.map((act, i) => (
          <Reveal key={act.id} delay={i * 80}>
            <PhotoCard
              src={act.poster!}
              alt={`${act.name} poster`}
              title={act.name}
              caption={`${act.time} · ${act.tag}`}
              ratio="3/4"
            />
          </Reveal>
        ))}
      </div>
      <PillLink href="/lineup" variant="outline" style={{ marginTop: 44 }}>
        Full lineup →
      </PillLink>
    </Section>
  )
}

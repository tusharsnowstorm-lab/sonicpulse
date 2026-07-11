import { publishedArtists } from '@/data/artists'
import Section from '@/components/ui/Section'
import PhotoCard from '@/components/ui/PhotoCard'
import Reveal from '@/components/ui/Reveal'
import { PillLink } from '@/components/ui/PillButton'

export default function ArtistTeaser() {
  const featured = publishedArtists.slice(0, 4)

  return (
    <Section eyebrow="The lineup" title="Twelve acts. Curated, not crowded.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 4,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {featured.map((artist, i) => (
          <Reveal key={artist.id} delay={i * 80}>
            <PhotoCard
              src={artist.image ?? '/images/hero-visual.jpg'}
              alt={artist.name}
              title={artist.name}
              caption={`${artist.stage === 'main' ? 'Main stage' : 'Sunrise stage'} · ${artist.setTime.split('–')[0]}`}
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

import Section from '@/components/ui/Section'
import PhotoCard from '@/components/ui/PhotoCard'
import Reveal from '@/components/ui/Reveal'
import { PillLink } from '@/components/ui/PillButton'
import ConceptArtNote from '@/components/ui/ConceptArtNote'
import { echoes } from '@/data/echoes'

const featured = echoes.filter((e) => e.image).slice(0, 3)

export default function EchoesTeaser() {
  return (
    <Section eyebrow="Art installations" title="Before language, there was frequency.">
      <p style={{ maxWidth: 560, margin: '0 auto 48px', color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.7 }}>
        Twelve towering installations, one founding myth. Twelve feet tall and lit for the night — walk them all
        before sunrise and the Loop closes with you inside it.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 4,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {featured.map((echo, i) => (
          <Reveal key={echo.id} delay={i * 80}>
            <PhotoCard
              src={echo.image!}
              alt={`${echo.name} — ${echo.tail}`}
              title={`${echo.name} · ${echo.tail}`}
              caption={`Echo ${echo.roman} — ${echo.phase}`}
              ratio="4/3"
            />
          </Reveal>
        ))}
      </div>
      <PillLink href="/echoes" variant="outline" style={{ marginTop: 44 }}>
        Walk all twelve echoes →
      </PillLink>
      <ConceptArtNote centered />
    </Section>
  )
}

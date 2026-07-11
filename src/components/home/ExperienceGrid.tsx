import Section from '@/components/ui/Section'
import PhotoCard from '@/components/ui/PhotoCard'
import Reveal from '@/components/ui/Reveal'

const experiences = [
  { title: 'The lounge', caption: 'Rest, recharge, re-enter. Open all seventeen hours.', src: '/images/hero-poster.webp' },
  { title: 'The sunrise set', caption: "The last two hours, as the sky turns. You'll understand when you're there.", src: '/images/poster-2.webp' },
  { title: 'Midnight kitchen', caption: 'Chef-led food court running till close.', src: '/images/hero-visual.jpg' },
  { title: 'Shuttle service', caption: 'Round-trip transport from central Dhaka. Add it at checkout.', src: '/images/hero-poster.webp' },
]

export default function ExperienceGrid() {
  return (
    <Section eyebrow="The experience" title="Everything between the sets is part of the show.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 4,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {experiences.map((exp, i) => (
          <Reveal key={exp.title} delay={i * 80}>
            <PhotoCard src={exp.src} alt={exp.title} title={exp.title} caption={exp.caption} ratio="4/3" captionStyle="prose" />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

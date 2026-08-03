import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import ArtistTeaser from '@/components/home/ArtistTeaser'
import ActivitiesTeaser from '@/components/home/ActivitiesTeaser'
import EchoesTeaser from '@/components/home/EchoesTeaser'
import TicketsTeaser from '@/components/home/TicketsTeaser'
import FAQTeaser from '@/components/home/FAQTeaser'

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicEvent',
            name: 'Sonic Pulse',
            startDate: '2026-09-25T16:00:00+06:00',
            endDate: '2026-09-26T09:30:00+06:00',
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: { '@type': 'Place', name: 'Venue announced to ticket holders', address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' } },
            organizer: { '@type': 'Organization', name: 'Dhaka Music Festival', url: 'https://sonicpulsefestival.com', sameAs: ['https://instagram.com/dhakamusicfestival', 'https://instagram.com/sonicpulsefestival'] },
            image: 'https://sonicpulsefestival.com/images/brand/logo-512.png',
            description: "Bangladesh's first sunset-to-sunrise music festival. Two stages, 800+ festival-goers, dusk till dawn. Presented by Dhaka Music Festival.",
          }),
        }}
      />
      <Hero />
      <StatsBar />
      <ArtistTeaser />
      <ActivitiesTeaser />
      <EchoesTeaser />
      <TicketsTeaser />
      <FAQTeaser />
    </>
  )
}

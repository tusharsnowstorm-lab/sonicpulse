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

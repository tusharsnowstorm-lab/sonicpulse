import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import ArtistTeaser from '@/components/home/ArtistTeaser'
import StageBreak from '@/components/home/StageBreak'
import ExperienceGrid from '@/components/home/ExperienceGrid'
import TicketsTeaser from '@/components/home/TicketsTeaser'
import FAQTeaser from '@/components/home/FAQTeaser'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ArtistTeaser />
      <StageBreak />
      <ExperienceGrid />
      <TicketsTeaser />
      <FAQTeaser />
    </>
  )
}

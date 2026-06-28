import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import StagesPreview from '@/components/home/StagesPreview'
import HoldBackTheVoid from '@/components/home/HoldBackTheVoid'
import ArtistTeaser from '@/components/home/ArtistTeaser'
import TicketsTeaser from '@/components/home/TicketsTeaser'
import FAQTeaser from '@/components/home/FAQTeaser'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <StagesPreview />
      <HoldBackTheVoid />
      <ArtistTeaser />
      <TicketsTeaser />
      <FAQTeaser />
    </>
  )
}

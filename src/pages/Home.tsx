import { Hero } from '@/components/home/Hero'
import { Premise } from '@/components/home/Premise'
import { HowItWorks } from '@/components/home/HowItWorks'
import { ImpactNumbers } from '@/components/home/ImpactNumbers'
import { PointsAndPrize } from '@/components/home/PointsAndPrize'
import { UpcomingEvents } from '@/components/home/UpcomingEvents'
import { ClosingCta } from '@/components/home/ClosingCta'

export function Home() {
  return (
    <>
      <Hero />
      <Premise />
      <HowItWorks />
      <ImpactNumbers />
      <PointsAndPrize />
      <UpcomingEvents />
      <ClosingCta />
    </>
  )
}

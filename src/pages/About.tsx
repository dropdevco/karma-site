import { AboutHero } from '@/components/about/AboutHero'
import { WhySection } from '@/components/about/WhySection'
import { MechanismSection } from '@/components/about/MechanismSection'
import { DifferenceSection } from '@/components/about/DifferenceSection'
import { InvolvedSection } from '@/components/about/InvolvedSection'
import { TeamSection } from '@/components/about/TeamSection'

export function About() {
  return (
    <>
      <AboutHero />
      <WhySection />
      <MechanismSection />
      <DifferenceSection />
      <InvolvedSection />
      <TeamSection />
    </>
  )
}

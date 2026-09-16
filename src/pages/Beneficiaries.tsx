import { BeneficiariesHero } from '@/components/beneficiaries/BeneficiariesHero'
import { SelectionSection } from '@/components/beneficiaries/SelectionSection'
import { PartnersGrid } from '@/components/beneficiaries/PartnersGrid'
import { ApplySection } from '@/components/beneficiaries/ApplySection'

export function Beneficiaries() {
  return (
    <>
      <BeneficiariesHero />
      <SelectionSection />
      <PartnersGrid />
      <ApplySection />
    </>
  )
}

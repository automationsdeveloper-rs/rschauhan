import Hero from '../components/home/Hero'
import { PartnerMarquee, StatsBar, TwoPaths } from '../components/home/TrustAndStats'
import FeaturedJobs from '../components/home/FeaturedJobs'
import HowItWorks from '../components/home/HowItWorks'
import { WhyChooseUs, Industries } from '../components/home/WhyAndIndustries'
import PricingPreview from '../components/home/PricingPreview'
import { Testimonials, FAQ } from '../components/home/TestimonialsAndFaq'
import FinalCTA from '../components/home/FinalCTA'

export default function Home() {
  return (
    <>
      <Hero />
      <PartnerMarquee />
      <StatsBar />
      <TwoPaths />
      <FeaturedJobs />
      <HowItWorks />
      <WhyChooseUs />
      <Industries />
      <PricingPreview />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  )
}

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Minus } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import PlanCard from '../components/pricing/PlanCard'
import { FAQList } from '../components/home/TestimonialsAndFaq'
import { pricing } from '../config/site'
import { useSeo } from '../lib/hooks'

const tabs = [['candidate', 'For Candidates'], ['employer', 'For Employers']]

// [feature, ...one value per plan] — true/false render as check/dash
const compare = {
  candidate: [
    ['Job requests included', '1', '1', 'Multiple'],
    ['Profile shared with recruiters', true, true, true],
    ['Email updates', true, true, true],
    ['Priority matching', false, true, true],
    ['Resume review tips', false, true, true],
    ['Interview support', false, true, true],
    ['Dedicated recruiter', false, false, true],
    ['Resume rewrite', false, false, true],
    ['Mock interview', false, false, true],
  ],
  employer: [
    ['Positions included', '1', 'Up to 5', 'Unlimited'],
    ['Verified profiles in 48 hrs', true, true, true],
    ['Recruiter follow-up', true, true, true],
    ['Employer dashboard', true, true, true],
    ['Dedicated recruiter', false, true, true],
    ['Priority sourcing', false, true, true],
    ['Replacement guarantee', false, true, true],
    ['Dedicated account manager', false, false, true],
    ['Custom SLAs & volume discounts', false, false, true],
  ],
}

const pricingFaqs = [
  { q: 'Are prices inclusive of GST?', a: 'No. Listed prices are exclusive of 18% GST, which is added at checkout. A GST invoice is emailed after payment.' },
  { q: 'Is applying to open jobs free?', a: 'Yes. Browsing and applying to any listed job is always free. Fees apply only to custom Job Requests (candidates) and Hiring Requests (employers).' },
  { q: 'What if you cannot find a match?', a: 'If we cannot share a relevant opportunity or profile within the committed window, you are eligible for a refund as per our Refund Policy.' },
  { q: 'Can employers pay on success instead?', a: 'Yes. For the Single Position plan we can work on a percentage of annual CTC on successful hiring. Choose Enterprise / contact us to discuss.' },
  { q: 'Which payment methods are supported?', a: 'UPI, credit and debit cards, net banking and wallets via Razorpay.' },
]

export default function Pricing() {
  useSeo({ title: 'Pricing — HireNest', description: 'Transparent pricing for candidates and employers. No hidden charges.' })
  const [sp] = useSearchParams()
  const [tab, setTab] = useState(sp.get('for') === 'employer' ? 'employer' : 'candidate')
  const plans = pricing[tab]

  return (
    <div className="pb-20 pt-28 md:pt-36">
      <div className="container">
        <SectionHeading eyebrow="Pricing" title="Simple, transparent pricing" text="Pick a plan, pay securely, and let our recruiters do the heavy lifting. Applying to open jobs is always free." />

        <div role="tablist" className="glass mx-auto mt-10 flex w-fit rounded-2xl p-1.5">
          {tabs.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors ${tab === id ? 'text-white' : 'text-muted hover:text-fg'}`}>
              {tab === id && <motion.span layoutId="price-pill" className="absolute inset-0 rounded-xl bg-brand-gradient-ui shadow-glow" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <div className="mt-14 grid gap-6 pt-3 md:grid-cols-3">{plans.map((p) => <PlanCard key={p.id} plan={p} kind={tab} />)}</div>

            <div className="mt-20">
              <h2 className="mb-6 text-center text-2xl font-extrabold md:text-3xl">Compare plans</h2>
              <div className="card overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="p-4 font-heading font-bold">Features</th>
                      {plans.map((p) => <th key={p.id} className={`p-4 text-center font-heading font-bold ${p.popular ? 'text-primary' : ''}`}>{p.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {compare[tab].map(([label, ...vals]) => (
                      <tr key={label} className="border-b border-line last:border-0 hover:bg-primary/5">
                        <th scope="row" className="p-4 font-medium">{label}</th>
                        {vals.map((v, i) => (
                          <td key={i} className="p-4 text-center">
                            {v === true ? <Check className="mx-auto h-5 w-5 text-success" aria-label="Included" /> : v === false ? <Minus className="mx-auto h-5 w-5 text-muted/50" aria-label="Not included" /> : <b>{v}</b>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-extrabold md:text-3xl">Pricing questions</h2>
          <FAQList items={pricingFaqs} />
        </div>
      </div>
    </div>
  )
}

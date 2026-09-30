import { Check } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import { Reveal } from '../ui/Motion'
import { pricing, formatINR } from '../../config/site'
import { useLang } from '../../i18n'

function Card({ title, sub, plans, cta, to, popularLabel, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="card h-full p-8">
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="mt-1 text-sm text-muted">{sub}</p>
        <ul className="mt-6 divide-y divide-line">
          {plans.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="flex items-center gap-2 font-semibold">{p.name}
                  {p.popular && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-700">{popularLabel}</span>}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted"><Check className="h-3.5 w-3.5 text-success" aria-hidden />{p.features[0]}</p>
              </div>
              <p className="text-right font-heading text-xl font-extrabold">{p.price ? formatINR(p.price) : 'Custom'}<span className="block text-[11px] font-medium text-muted">{p.unit}</span></p>
            </li>
          ))}
        </ul>
        <Button to={to} arrow className="mt-6 w-full">{cta}</Button>
      </div>
    </Reveal>
  )
}

export default function PricingPreview() {
  const { d } = useLang()
  return (
    <section className="section bg-primary/[0.03]">
      <div className="container">
        <SectionHeading eyebrow={d.pricing.eyebrow} title={d.pricing.title} text={d.pricing.text} />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Card title={d.pricing.candidate} sub={d.pricing.candidateSub} plans={pricing.candidate} cta={d.pricing.seeCandidate} to="/pricing" popularLabel={d.pricing.popular} />
          <Card title={d.pricing.employer} sub={d.pricing.employerSub} plans={pricing.employer} cta={d.pricing.seeEmployer} to="/pricing?for=employer" popularLabel={d.pricing.popular} delay={0.12} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">{d.pricing.free} {d.pricing.gst}</p>
      </div>
    </section>
  )
}

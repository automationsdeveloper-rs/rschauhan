import { Check } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import { Reveal } from '../ui/Motion'
import { pricing, formatINR } from '../../config/site'

function Card({ title, sub, plans, cta, to, delay }) {
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
                  {p.popular && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-600">Popular</span>}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted"><Check className="h-3.5 w-3.5 text-success" />{p.features[0]}</p>
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
  return (
    <section className="section bg-primary/[0.03]">
      <div className="container">
        <SectionHeading eyebrow="Pricing" title="Simple, transparent pricing" text="Pay only for the service you need. No hidden charges, ever." />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Card title="Candidate Plans" sub="For job seekers raising a custom job request" plans={pricing.candidate} cta="See candidate plans" to="/pricing" />
          <Card title="Employer Plans" sub="For companies raising hiring requests" plans={pricing.employer} cta="See employer plans" to="/pricing" delay={0.12} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">Applying to open jobs is always <b className="text-fg">free</b>. Prices exclude GST.</p>
      </div>
    </section>
  )
}

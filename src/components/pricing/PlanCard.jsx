import { Check } from 'lucide-react'
import Button from '../ui/Button'
import { TiltCard } from '../ui/Motion'
import { formatINR } from '../../config/site'

export default function PlanCard({ plan, kind }) {
  const to = kind === 'candidate' ? `/request-job?plan=${plan.id}#request-form` : `/hire?plan=${plan.id}#hire-form`
  return (
    <TiltCard max={3} className={`relative flex h-full flex-col rounded-xl3 p-7 ${plan.popular ? 'border-2 border-primary bg-surface shadow-lift' : 'card'}`}>
      {plan.popular && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient-ui px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-glow">Most popular</span>}
      <h3 className="text-xl font-extrabold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
      <p className="mt-5 font-heading text-4xl font-extrabold">{plan.price ? formatINR(plan.price) : 'Custom'}</p>
      <p className="text-sm text-muted">{plan.unit}{plan.price ? ' + GST' : ''}</p>
      <ul className="my-6 flex-1 space-y-3">
        {plan.features.map((f) => <li key={f} className="flex gap-2.5 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}</li>)}
      </ul>
      <Button to={to} variant={plan.popular ? 'primary' : 'outline'} arrow className="w-full">{plan.price ? 'Choose Plan' : 'Talk to us'}</Button>
    </TiltCard>
  )
}

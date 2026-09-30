import { motion } from 'framer-motion'
import { Check, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { breakdown } from '../../../shared/plans'
import { formatINR } from '../../config/site'
import Confetti from './Confetti'
import Button from '../ui/Button'

export function PlanPicker({ plans, value, onChange, disabledIf }) {
  return (
    <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Choose a plan">
      {plans.map((p) => {
        const off = disabledIf?.(p)
        const on = value === p.id
        return (
          <button key={p.id} type="button" role="radio" aria-checked={on} disabled={!!off} onClick={() => onChange(p.id)}
            className={`relative rounded-2xl border-2 p-5 text-left transition ${on ? 'border-primary bg-primary/5 shadow-lift' : 'border-line hover:border-primary/50'} ${off ? 'cursor-not-allowed opacity-50' : ''}`}>
            {p.popular && <span className="absolute -top-3 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">Most popular</span>}
            <span className={`absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border-2 ${on ? 'border-primary bg-primary text-white' : 'border-line'}`}>{on && <Check className="h-3 w-3" />}</span>
            <p className="pr-8 font-heading font-bold">{p.name}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold">{p.price ? formatINR(p.price) : 'Custom'}<span className="ml-1 text-xs font-medium text-muted">{p.unit}</span></p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted">{p.features.slice(0, 4).map((f) => <li key={f} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />{f}</li>)}</ul>
            {off && <p className="mt-3 text-xs font-semibold text-danger">{off}</p>}
          </button>
        )
      })}
    </div>
  )
}

export function OrderSummary({ plan }) {
  if (!plan) return null
  if (plan.price == null) {
    return <div className="rounded-2xl border border-line bg-primary/5 p-5 text-sm"><b>Enterprise plan:</b> no payment now. Submit your request and our team will contact you within 24 hours with a custom quote.</div>
  }
  const b = breakdown(plan.price)
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="font-heading font-bold">Order summary</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-muted">{plan.name}</dt><dd>{formatINR(b.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">GST (18%)</dt><dd>{formatINR(b.gst)}</dd></div>
        <div className="flex justify-between border-t border-line pt-3 font-heading text-lg font-extrabold"><dt>Total</dt><dd className="text-gradient">{formatINR(b.total)}</dd></div>
      </dl>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-success" />Secure payment by Razorpay · UPI, cards, net banking · GST invoice by email</p>
    </div>
  )
}

export function SuccessScreen({ code, title, lead, timeline, dashboardTo, demo }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative py-4 text-center">
      <Confetti />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success"><Check className="h-11 w-11" strokeWidth={3} /></motion.div>
      <h2 className="mt-6 text-3xl font-extrabold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{lead}</p>
      <div className="mx-auto mt-6 w-fit rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-6 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your request ID</p>
        <p className="font-heading text-2xl font-extrabold tracking-wider text-primary">{code}</p>
      </div>
      {demo && <p className="mx-auto mt-3 max-w-md text-xs text-accent-600">Demo mode: nothing was saved or charged.</p>}
      <div className="mx-auto mt-10 max-w-md text-left">
        <h3 className="mb-4 font-heading font-bold">What happens next</h3>
        <ol className="relative space-y-5 border-l-2 border-line pl-6">
          {timeline.map(([t, d], i) => (
            <motion.li key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="relative">
              <span className="absolute -left-[33px] grid h-5 w-5 place-items-center rounded-full bg-brand-gradient-ui text-[10px] font-bold text-white">{i + 1}</span>
              <p className="font-semibold">{t}</p><p className="text-sm text-muted">{d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to={dashboardTo} arrow>Go to dashboard</Button>
        <Link to="/" className="btn btn-outline">Back to home</Link>
      </div>
    </motion.div>
  )
}

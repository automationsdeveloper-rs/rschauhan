import { BadgeCheck, Lock, Search, Send, Sparkles, Star, UserCheck } from 'lucide-react'
import JobRequestForm from '../components/forms/JobRequestForm'
import { Reveal, Stagger, StaggerItem } from '../components/ui/Motion'
import SectionHeading from '../components/ui/SectionHeading'
import { pricing, formatINR } from '../config/site'
import { useSeo } from '../lib/hooks'

const steps = [
  { icon: Send, title: 'Tell us what you want', text: 'Share your dream role, salary, locations and CV in 2 minutes.' },
  { icon: Search, title: 'We hunt for you', text: 'Recruiters search open roles and our employer network for matches.' },
  { icon: UserCheck, title: 'Interview & get hired', text: 'We shortlist you, set up interviews and support you to the offer.' },
]
const badges = [[Lock, 'Secure payments via Razorpay'], [BadgeCheck, 'Verified recruiters'], [Star, '95% client satisfaction'], [Sparkles, 'Refund if no relevant match']]

export default function RequestJob() {
  useSeo({ title: 'Request a Job — HireNest', description: "Can't find your dream job? Tell us what you want and our recruiters will find it for you." })
  return (
    <div className="pb-20 pt-28 md:pt-36">
      <div className="container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Job request service</span>
          <h1 className="text-4xl font-extrabold md:text-6xl">Can&apos;t find your dream job? <span className="text-gradient">Let us find it for you.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">Tell us the job you want. Our recruiters match your profile with openings, shortlist you and coordinate interviews.</p>
        </Reveal>

        <Stagger className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <StaggerItem key={s.title}>
              <div className="card h-full p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient-ui text-white shadow-glow"><s.icon className="h-6 w-6" /></span>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">Step {i + 1}</p>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mx-auto mt-12 max-w-3xl rounded-3xl bg-brand-gradient-ui p-6 text-white shadow-glow md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase tracking-wider text-white/80">Plans start at</p><p className="font-heading text-4xl font-extrabold">{formatINR(pricing.candidate[0].price)} <span className="text-base font-medium text-white/80">+ GST</span></p></div>
            <ul className="space-y-1 text-sm text-white/90">{pricing.candidate.map((p) => <li key={p.id}>• {p.name} — <b>{formatINR(p.price)}</b></li>)}</ul>
          </div>
        </Reveal>

        <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-muted">
          {badges.map(([Icon, t]) => <li key={t} className="flex items-center gap-2"><Icon className="h-4 w-4 text-success" />{t}</li>)}
        </ul>

        <div className="mt-16"><SectionHeading title="Start your request" text="Your progress is saved automatically — pick up where you left off any time." /></div>
        <div className="mt-10"><JobRequestForm /></div>
      </div>
    </div>
  )
}

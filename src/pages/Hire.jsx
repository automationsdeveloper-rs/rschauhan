import { Clock, Filter, LayoutDashboard, ShieldCheck, Target, Users } from 'lucide-react'
import HiringRequestForm from '../components/forms/HiringRequestForm'
import { PartnerMarquee } from '../components/home/TrustAndStats'
import { Reveal, Stagger, StaggerItem, TiltCard } from '../components/ui/Motion'
import SectionHeading from '../components/ui/SectionHeading'
import PlanCard from '../components/pricing/PlanCard'
import Button from '../components/ui/Button'
import { pricing } from '../config/site'
import { useSeo } from '../lib/hooks'
import { useLang } from '../i18n'

const benefits = [
  { icon: Clock, title: '48-hour first profiles', text: 'Verified, interview-ready profiles land in your dashboard within two days.' },
  { icon: Filter, title: 'Screened, not spammed', text: 'Every candidate is called, verified and matched to your budget and skills.' },
  { icon: Users, title: 'Dedicated recruiter', text: 'One point of contact who understands your team and culture.' },
  { icon: Target, title: 'Any role, any scale', text: 'From a single specialist to bulk hiring across cities.' },
  { icon: LayoutDashboard, title: 'Track everything', text: 'Requests, shortlists, CVs and invoices in one employer dashboard.' },
  { icon: ShieldCheck, title: 'Transparent pricing', text: 'Fixed fees or success-based options. No hidden charges.' },
]

export default function Hire() {
  useSeo({ title: 'Hire Talent — HireNest', description: 'Raise a hiring request and get verified, shortlisted profiles within 48 hours.' })
  const { d } = useLang()
  return (
    <div className="pt-28 md:pt-36">
      <div className="container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">For employers</span>
          <h1 className="text-4xl font-extrabold md:text-6xl">Hire the right talent, <span className="text-gradient">faster.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">Tell us the position, budget and skills. We source, screen and deliver verified profiles — you just interview and hire.</p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <StaggerItem key={b.title}>
              <TiltCard max={3} className="card h-full p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><b.icon className="h-6 w-6" /></span>
                <h3 className="mt-4 text-lg font-bold">{b.title}</h3><p className="mt-1 text-sm text-muted">{b.text}</p>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-20">
          <SectionHeading eyebrow="Process" title="From brief to hire in four steps" />
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {d.how.employers.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} as="li">
                <div className="card relative h-full p-6">
                  <span className="text-gradient font-heading text-5xl font-extrabold">{i + 1}</span>
                  <h3 className="mt-2 font-bold">{s.title}</h3><p className="mt-1 text-sm text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-20"><PartnerMarquee /></div>

      <div className="container">
        {/* Full Suite HR Operations Callout */}
        <div className="mt-20 card overflow-hidden border border-primary/30 bg-gradient-to-r from-primary/5 via-surface to-secondary/5 p-8 md:p-12 shadow-soft">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="eyebrow">Enterprise & MSME HR Suite</span>
              <h2 className="text-2xl font-extrabold md:text-3xl text-fg">
                Need more than hiring? Power your entire HR, Payroll & Compliance.
              </h2>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                Beyond delivering pre-vetted candidates within 48 hours, HireNest implements cutting-edge <strong>Cloud HRMS</strong>, executes <strong>zero-error managed payroll</strong>, and manages <strong>100% compliant EPF, ESIC, PT & POSH operations</strong> for companies across India.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-lg bg-surface border border-line px-3 py-1.5 text-xs font-semibold text-fg">✓ Cloud HRMS & Mobile Attendance</span>
                <span className="rounded-lg bg-surface border border-line px-3 py-1.5 text-xs font-semibold text-fg">✓ 100% EPF & ESI Monthly Filings</span>
                <span className="rounded-lg bg-surface border border-line px-3 py-1.5 text-xs font-semibold text-fg">✓ Managed Payroll & Form 16</span>
                <span className="rounded-lg bg-surface border border-line px-3 py-1.5 text-xs font-semibold text-fg">✓ Virtual HR Department Desk</span>
              </div>
            </div>
            <div className="flex flex-col items-start lg:items-end justify-center gap-3">
              <Button to="/services" size="lg" arrow className="w-full sm:w-auto">
                Explore Full HR Solutions
              </Button>
              <Button to="/contact?service=compliance" variant="outline" size="sm" className="w-full sm:w-auto">
                Book Free Compliance Audit
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <SectionHeading eyebrow="Pricing" title="Choose how you want to hire" text="Prices exclude 18% GST. Success-based options available on request." />
          <div className="mt-12 grid gap-6 pt-3 md:grid-cols-3">{pricing.employer.map((p) => <PlanCard key={p.id} plan={p} kind="employer" />)}</div>
        </div>

        <div className="mt-24 pb-20">
          <SectionHeading title="Raise a hiring request" text="Add one or many positions. Your progress is saved automatically." />
          <div className="mt-10"><HiringRequestForm /></div>
        </div>
      </div>
    </div>
  )
}

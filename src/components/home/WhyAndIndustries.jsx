import { Link } from 'react-router-dom'
import SectionHeading from '../ui/SectionHeading'
import { Stagger, StaggerItem, TiltCard } from '../ui/Motion'
import { whyUs, industries } from '../../config/site'
import { icons } from '../../lib/icons'

export function WhyChooseUs() {
  return (
    <section className="section bg-primary/[0.03]">
      <div className="container">
        <SectionHeading eyebrow="Why choose us" title="Built different, for both sides of hiring" text="A recruitment partner that behaves like a product — fast, transparent and human." />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-4">
          {whyUs.map((w, i) => {
            const Icon = icons[w.icon]
            const feature = i === 0
            return (
              <StaggerItem key={w.title} className={w.span || ''}>
                <TiltCard max={3} className={`group relative h-full overflow-hidden rounded-xl3 p-7 ${feature ? 'bg-brand-gradient text-white shadow-glow' : 'card'}`}>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${feature ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}><Icon className="h-6 w-6" /></span>
                  <h3 className="mt-5 text-xl font-bold">{w.title}</h3>
                  <p className={`mt-2 ${feature ? 'text-white/85' : 'text-muted'}`}>{w.text}</p>
                </TiltCard>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

export function Industries() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Industries" title="Industries we hire for" text="From startups to enterprises — deep networks across 10+ sectors." />
        <Stagger gap={0.05} className="mt-12 flex flex-wrap justify-center gap-3">
          {industries.map((ind) => {
            const Icon = icons[ind.icon]
            return (
              <StaggerItem key={ind.name}>
                <Link to={`/jobs?industry=${encodeURIComponent(ind.name)}`} className="card group flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-1 hover:border-primary hover:shadow-lift">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-brand-gradient group-hover:text-white"><Icon className="h-4 w-4" /></span>
                  {ind.name}
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

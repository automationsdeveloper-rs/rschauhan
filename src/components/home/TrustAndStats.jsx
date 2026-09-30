import { partners, stats } from '../../config/site'
import { Counter, Stagger, StaggerItem, Reveal, TiltCard } from '../ui/Motion'
import Button from '../ui/Button'
import { useLang } from '../../i18n'

/** Text wordmark placeholders — swap for real SVG logos later. */
export function PartnerMarquee() {
  const { d } = useLang()
  const row = [...partners, ...partners]
  return (
    <section className="border-y border-line bg-surface/50 py-8" aria-label={d.partners}>
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted">{d.partners}</p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-14 hover:[animation-play-state:paused]">
          {row.map((p, i) => (
            <span key={i} aria-hidden={i >= partners.length} className="flex items-center gap-2 font-heading text-xl font-extrabold text-muted transition hover:text-primary">
              <span className="h-5 w-5 rounded-md bg-brand-gradient opacity-60" />{p}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatsBar() {
  const { d } = useLang()
  return (
    <section className="container -mt-px py-16">
      <Stagger className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <StaggerItem key={i} className="text-center">
            <p className="text-gradient font-heading text-4xl font-extrabold md:text-5xl"><Counter to={s.value} suffix={s.suffix} /></p>
            <p className="mt-2 text-sm font-medium text-muted">{d.stats[i]}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export function TwoPaths() {
  const { d } = useLang()
  return (
    <section className="container pb-20 md:pb-28">
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <PathCard tone="light" emoji="🎯" title={d.paths.seeker.title} text={d.paths.seeker.text}
            actions={[{ label: d.paths.seeker.browse, to: '/jobs', variant: 'primary' }, { label: d.paths.seeker.request, to: '/request-job', variant: 'outline' }]} />
        </Reveal>
        <Reveal delay={0.12}>
          <PathCard tone="dark" emoji="🏢" title={d.paths.hiring.title} text={d.paths.hiring.text}
            actions={[{ label: d.paths.hiring.cta, to: '/hire', variant: 'accent' }]} />
        </Reveal>
      </div>
    </section>
  )
}

function PathCard({ tone, emoji, title, text, actions }) {
  const dark = tone === 'dark'
  return (
    <TiltCard className={`relative h-full overflow-hidden rounded-xl3 p-8 md:p-10 ${dark ? 'bg-[#12172B] text-white' : 'card'}`}>
      <div className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl ${dark ? 'bg-accent/30' : 'bg-primary/20'}`} />
      <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-3xl" aria-hidden>{emoji}</span>
      <h2 className="relative mt-6 text-2xl font-extrabold md:text-3xl">{title}</h2>
      <p className={`relative mt-3 max-w-md ${dark ? 'text-white/70' : 'text-muted'}`}>{text}</p>
      <div className="relative mt-8 flex flex-wrap gap-3">
        {actions.map((a) => <Button key={a.label} to={a.to} variant={a.variant} arrow>{a.label}</Button>)}
      </div>
    </TiltCard>
  )
}

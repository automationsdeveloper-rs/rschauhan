import { Eye, HeartHandshake, ShieldCheck, Target, Zap } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'
import { Counter, Reveal, Stagger, StaggerItem, TiltCard } from '../components/ui/Motion'
import { PartnerMarquee } from '../components/home/TrustAndStats'
import { site, stats } from '../config/site'
import { useSeo } from '../lib/hooks'
import { useLang } from '../i18n'

// Placeholder team — replace names, roles and bios with your real team before launch.
const team = [
  { name: 'Aarav Mehta', role: 'Founder & CEO', bio: 'Ten years in staffing; started HireNest to fix hiring for both sides of the table.' },
  { name: 'Priya Nair', role: 'Head of Recruitment', bio: 'Leads the recruiter team and owns the 48-hour first-profile promise.' },
  { name: 'Rahul Verma', role: 'Employer Success', bio: 'Your single point of contact from brief to offer letter.' },
  { name: 'Sana Khan', role: 'Product & Engineering', bio: 'Builds the dashboards, matching and everything in between.' },
]

const values = [
  { icon: HeartHandshake, title: 'Candidates first', text: 'Every job seeker gets a real human, honest updates and a fair shot. Applying to open jobs is free, always.' },
  { icon: Eye, title: 'Radical transparency', text: 'Published prices, clear timelines and refunds when we fall short. No hidden charges, ever.' },
  { icon: Zap, title: 'Speed with rigour', text: 'First profiles in 48 hours — and every profile is called, verified and matched to the brief.' },
  { icon: ShieldCheck, title: 'Privacy by default', text: 'CVs live in private storage with expiring links. Employers see a profile only with the candidate’s consent.' },
]

const timeline = [
  { year: '2022', title: 'Founded in Bengaluru', text: 'Started as a two-person recruiting desk helping startups hire their first engineers.' },
  { year: '2023', title: '500 placements', text: 'Expanded into sales, finance and healthcare hiring across five cities.' },
  { year: '2024', title: 'Employer dashboard', text: 'Launched self-serve hiring requests with verified profiles delivered online.' },
  { year: '2025', title: '5,000+ placements, 200+ partners', text: 'Crossed 5,000 candidates placed with a 95% client-satisfaction score.' },
  { year: '2026', title: 'Job Request service', text: 'Flipped the model: candidates now tell us the job they want, and we hunt for it.' },
]

export default function About() {
  useSeo({ title: `About — ${site.name}`, description: `${site.name} is a two-sided recruitment marketplace: free job applications, paid job-hunting for candidates, and verified profiles in 48 hours for employers.` })
  const { d } = useLang()

  return (
    <div className="pt-28 md:pt-36">
      <div className="container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">About {site.name}</span>
          <h1 className="text-4xl font-extrabold md:text-6xl">Recruitment, <span className="text-gradient">rebuilt as a product.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">We sit between people who want a better job and companies that need better people, and we make both sides faster, fairer and less painful.</p>
        </Reveal>

        {/* story + stats */}
        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <Reveal className="prose-site">
            <h2 className="!mt-0">Our story</h2>
            <p>HireNest began in {site.founded} as a two-person recruiting desk in Bengaluru. We kept hearing the same two complaints: candidates applied into a black hole and never heard back, and employers drowned in unscreened resumes.</p>
            <p>So we built a marketplace that treats recruitment like software. Candidates apply for free or, when nothing fits, pay a small fee for a recruiter to hunt on their behalf. Employers post a requirement, pay a transparent fee and receive verified, interview-ready profiles inside two days — all tracked in a dashboard, not an inbox.</p>
            <p>Today we place thousands of people a year across ten industries, and we are only getting started.</p>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <StaggerItem key={i}>
                <div className="card p-6 text-center">
                  <p className="text-gradient font-heading text-4xl font-extrabold"><Counter to={s.value} suffix={s.suffix} /></p>
                  <p className="mt-1 text-sm font-medium text-muted">{d.stats[i]}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* mission / vision */}
        <div className="mt-20 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="card h-full p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden><Target className="h-6 w-6" /></span>
              <h2 className="mt-5 text-2xl font-extrabold">Our mission</h2>
              <p className="mt-2 text-muted">Make every job search and every hire in India faster, more transparent and more human — with a real recruiter behind every match.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-xl3 bg-brand-gradient-ui p-8 text-white shadow-glow">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20" aria-hidden><Eye className="h-6 w-6" /></span>
              <h2 className="mt-5 text-2xl font-extrabold">Our vision</h2>
              <p className="mt-2 text-white/90">A country where nobody applies into a black hole and no company hires blind — where the right person and the right role find each other in days, not months.</p>
            </div>
          </Reveal>
        </div>

        {/* values */}
        <div className="mt-24">
          <SectionHeading eyebrow="Values" title="What we stand for" />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <TiltCard max={3} className="card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden><v.icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{v.text}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* team */}
        <div className="mt-24">
          <SectionHeading eyebrow="Team" title="The people behind the matches" text="A small team of recruiters, engineers and former hiring managers." />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <StaggerItem key={m.name}>
                <TiltCard max={4} className="card h-full p-6 text-center">
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-gradient-ui font-heading text-2xl font-extrabold text-white" aria-hidden>{m.name.split(' ').map((x) => x[0]).join('')}</span>
                  <h3 className="mt-4 text-lg font-bold">{m.name}</h3>
                  <p className="text-sm font-semibold text-primary">{m.role}</p>
                  <p className="mt-2 text-sm text-muted">{m.bio}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* timeline */}
        <div className="mt-24">
          <SectionHeading eyebrow="Journey" title="How we got here" />
          <ol className="relative mx-auto mt-12 max-w-3xl border-l-2 border-line pl-8">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.06} as="li" className="relative pb-10 last:pb-0">
                <span className="absolute -left-[41px] top-1 grid h-5 w-5 place-items-center rounded-full border-4 border-bg bg-primary" aria-hidden />
                <p className="text-sm font-bold text-primary">{t.year}</p>
                <h3 className="text-xl font-bold">{t.title}</h3>
                <p className="mt-1 text-muted">{t.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-24"><PartnerMarquee /></div>

      <div className="container py-20 text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">Want to work with us?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">Whether you are looking for a job, hiring for one, or want to join the team — we would love to hear from you.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/jobs" arrow>{d.hero.findJob}</Button>
          <Button to="/hire" variant="outline">{d.hero.hire}</Button>
          <Button to="/contact" variant="ghost">{d.nav.contact}</Button>
        </div>
      </div>
    </div>
  )
}

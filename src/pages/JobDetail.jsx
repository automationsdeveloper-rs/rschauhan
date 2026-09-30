import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bookmark, Briefcase, CheckCircle2, Clock, Gift, IndianRupee, ListChecks, MapPin, Share2, Laptop } from 'lucide-react'
import Button from '../components/ui/Button'
import { Reveal } from '../components/ui/Motion'
import JobListCard from '../components/jobs/JobListCard'
import { useJobs, useSavedJobs, useSeo } from '../lib/hooks'
import { useToast } from '../context/ToastContext'
import { postedLabel, salaryLabel, expLabel } from '../data/jobs'
import { site } from '../config/site'

export function JobDetailSkeleton() {
  return (
    <div className="container grid gap-8 pb-20 pt-32 lg:grid-cols-[1fr_340px]" aria-hidden>
      <div className="space-y-4"><div className="skeleton h-10 w-2/3" /><div className="skeleton h-5 w-1/3" /><div className="skeleton h-64 w-full" /></div>
      <div className="skeleton h-64" />
    </div>
  )
}

export function JobNotFound() {
  return (
    <div className="container grid min-h-[70vh] place-items-center pt-24 text-center">
      <div>
        <p className="text-6xl">🔍</p>
        <h1 className="mt-4 text-3xl font-extrabold">This job is no longer available</h1>
        <p className="mt-2 text-muted">It may have been filled or removed.</p>
        <Button to="/jobs" className="mt-6" arrow>Browse open jobs</Button>
      </div>
    </div>
  )
}

const EMP_TYPE = { 'Full-time': 'FULL_TIME', 'Part-time': 'PART_TIME', Contract: 'CONTRACTOR', Internship: 'INTERN' }

const Block = ({ icon: Icon, title, items }) => (
  <Reveal className="card p-6 md:p-8">
    <h2 className="flex items-center gap-2.5 text-xl font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>{title}</h2>
    <ul className="mt-4 space-y-2.5">{items.map((i) => <li key={i} className="flex gap-3 text-muted"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />{i}</li>)}</ul>
  </Reveal>
)

export default function JobDetail() {
  const { id } = useParams()
  const { jobs, loading } = useJobs()
  const { isSaved, toggle } = useSavedJobs()
  const { toast } = useToast()
  const job = jobs.find((j) => j.id === id)

  const jsonLd = useMemo(() => job && ({
    '@context': 'https://schema.org', '@type': 'JobPosting',
    title: job.title, description: job.description,
    datePosted: new Date(Date.now() - job.posted_days_ago * 864e5).toISOString().slice(0, 10),
    employmentType: EMP_TYPE[job.job_type],
    hiringOrganization: { '@type': 'Organization', name: job.company },
    jobLocationType: job.work_mode === 'Remote' ? 'TELECOMMUTE' : undefined,
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'IN' } },
    baseSalary: { '@type': 'MonetaryAmount', currency: 'INR', value: { '@type': 'QuantitativeValue', minValue: job.salary_min * 1e5, maxValue: job.salary_max * 1e5, unitText: 'YEAR' } },
    skills: job.skills.join(', '),
  }), [job])

  useSeo({ title: job ? `${job.title} at ${job.company} — ${site.name}` : 'Job', description: job?.description, jsonLd })

  if (loading) return <JobDetailSkeleton />
  if (!job) return <JobNotFound />

  const similar = jobs.filter((j) => j.id !== job.id && (j.industry === job.industry || j.skills.some((s) => job.skills.includes(s)))).slice(0, 3)
  const share = async () => {
    const data = { title: job.title, text: `${job.title} at ${job.company}`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(data.url); toast('Link copied to clipboard', 'success') }
    } catch { /* user cancelled */ }
  }
  const saved = isSaved(job.id)

  return (
    <div className="container pb-20 pt-28 md:pt-32">
      <Link to="/jobs" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" />All jobs</Link>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Reveal className="card p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-gradient-ui font-heading text-2xl font-extrabold text-white">{job.company[0]}</span>
              <div>
                <h1 className="text-2xl font-extrabold md:text-4xl">{job.title}</h1>
                <p className="mt-1 text-lg text-muted">{job.company}</p>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              {[[MapPin, job.location], [Laptop, `${job.work_mode} · ${job.job_type}`], [IndianRupee, salaryLabel(job)], [Briefcase, `${expLabel(job)} experience`], [Clock, `Posted ${postedLabel(job.posted_days_ago).toLowerCase()}`]].map(([Icon, t], i) => (
                <li key={i} className="flex items-center gap-2.5 rounded-xl bg-primary/5 px-3.5 py-2.5 text-fg"><Icon className="h-4 w-4 text-primary" />{t}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">{job.skills.map((s) => <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{s}</span>)}</div>
          </Reveal>

          <Reveal className="card p-6 md:p-8"><h2 className="text-xl font-extrabold">About the role</h2><p className="mt-3 leading-relaxed text-muted">{job.description}</p></Reveal>
          <Block icon={ListChecks} title="Responsibilities" items={job.responsibilities} />
          <Block icon={CheckCircle2} title="Requirements" items={job.requirements} />
          <Block icon={Gift} title="Benefits" items={job.benefits} />
        </div>

        {/* sticky apply panel */}
        <aside className="lg:sticky lg:top-24">
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Salary</p>
            <p className="text-gradient font-heading text-3xl font-extrabold">{salaryLabel(job)}</p>
            <Button to={`/jobs/${job.id}/apply`} size="lg" arrow className="mt-5 w-full">Apply Now</Button>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={() => { toggle(job.id); toast(saved ? 'Removed from saved jobs' : 'Job saved', 'success') }} aria-pressed={saved} className={`btn btn-outline ${saved ? '!border-primary !text-primary' : ''}`}><Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />{saved ? 'Saved' : 'Save'}</button>
              <button onClick={share} className="btn btn-outline"><Share2 className="h-4 w-4" />Share</button>
            </div>
            <p className="mt-5 rounded-xl bg-accent/10 p-3 text-xs text-accent-600">Not the right fit? <Link to="/request-job" className="font-bold underline">Raise a job request</Link> and we&apos;ll find you a match.</p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">Similar jobs</h2>
          <div className="grid gap-4 lg:grid-cols-3">{similar.map((j) => <JobListCard key={j.id} job={j} saved={isSaved(j.id)} onToggleSave={toggle} />)}</div>
        </section>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight, Clock, IndianRupee, MapPin, Briefcase } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import { Stagger, StaggerItem, TiltCard } from '../ui/Motion'
import { JobCardSkeleton } from '../jobs/JobListCard'
import { useJobs } from '../../lib/hooks'
import { postedLabel, salaryLabel, expLabel } from '../../data/jobs'

const typeTone = { 'Full-time': 'bg-primary/10 text-primary', 'Part-time': 'bg-accent/10 text-accent-600', Contract: 'bg-secondary/15 text-secondary-600', Internship: 'bg-success/10 text-success' }

export function JobCard({ job }) {
  return (
    <TiltCard className="card group h-full p-6" max={4}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient font-heading text-lg font-extrabold text-white">{job.company[0]}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeTone[job.job_type]}`}>{job.job_type}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug"><Link to={`/jobs/${job.id}`} className="after:absolute after:inset-0 hover:text-primary">{job.title}</Link></h3>
      <p className="text-sm text-muted">{job.company}</p>

      <ul className="mt-4 space-y-2 text-sm text-muted">
        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{job.location} · {job.work_mode}</li>
        <li className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" />{salaryLabel(job)}</li>
        <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" />{expLabel(job)}</li>
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="flex items-center gap-1.5 text-xs text-muted"><Clock className="h-3.5 w-3.5" />{postedLabel(job.posted_days_ago)}</span>
        <span className="flex items-center gap-1 text-sm font-semibold text-primary">Apply Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" /></span>
      </div>
    </TiltCard>
  )
}

export default function FeaturedJobs() {
  const { jobs, loading } = useJobs()
  return (
    <section className="section bg-primary/[0.03]">
      <div className="container">
        <SectionHeading eyebrow="Latest openings" title="Fresh jobs, hand-picked for you" text="New roles from verified employers, added every day." />
        {loading ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)}</div>
        ) : (
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.slice(0, 6).map((j) => <StaggerItem key={j.id} className="relative"><JobCard job={j} /></StaggerItem>)}
          </Stagger>
        )}
        <div className="mt-12 text-center"><Button to="/jobs" variant="outline" size="lg" arrow>View All Jobs</Button></div>
      </div>
    </section>
  )
}

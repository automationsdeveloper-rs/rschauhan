import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bookmark, Briefcase, Clock, IndianRupee, MapPin } from 'lucide-react'
import { postedLabel, salaryLabel, expLabel } from '../../data/jobs'

const typeTone = { 'Full-time': 'bg-primary/10 text-primary', 'Part-time': 'bg-accent/10 text-accent-600', Contract: 'bg-secondary/15 text-secondary-600', Internship: 'bg-success/10 text-success' }

export function JobCardSkeleton() {
  return (
    <div className="card p-6" aria-hidden>
      <div className="flex gap-4"><div className="skeleton h-12 w-12 shrink-0" /><div className="flex-1 space-y-2"><div className="skeleton h-5 w-2/3" /><div className="skeleton h-4 w-1/3" /></div></div>
      <div className="mt-5 flex gap-2"><div className="skeleton h-6 w-20" /><div className="skeleton h-6 w-24" /><div className="skeleton h-6 w-16" /></div>
      <div className="mt-5 flex justify-between"><div className="skeleton h-4 w-32" /><div className="skeleton h-9 w-28" /></div>
    </div>
  )
}

export default function JobListCard({ job, saved, onToggleSave }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="card group relative p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift md:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient font-heading text-lg font-extrabold text-white">{job.company[0]}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-snug">
            <Link to={`/jobs/${job.id}`} className="after:absolute after:inset-0 after:content-[''] hover:text-primary">{job.title}</Link>
          </h3>
          <p className="text-sm text-muted">{job.company}</p>
        </div>
        <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:block ${typeTone[job.job_type]}`}>{job.job_type}</span>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
        <li className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{job.location} · {job.work_mode}</li>
        <li className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4 text-primary" />{salaryLabel(job)}</li>
        <li className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary" />{expLabel(job)}</li>
      </ul>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 5).map((s) => <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">{s}</span>)}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="flex items-center gap-1.5 text-xs text-muted"><Clock className="h-3.5 w-3.5" />Posted {postedLabel(job.posted_days_ago).toLowerCase()}</span>
        <div className="relative z-10 flex items-center gap-2">
          <button onClick={() => onToggleSave(job.id)} aria-pressed={saved} aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
            className={`grid h-10 w-10 place-items-center rounded-xl border transition ${saved ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted hover:border-primary hover:text-primary'}`}>
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>
          <Link to={`/jobs/${job.id}/apply`} className="btn btn-primary group/apply !px-4 !py-2.5">Apply Now <ArrowRight className="h-4 w-4 transition-transform group-hover/apply:translate-x-1" /></Link>
        </div>
      </div>
    </motion.article>
  )
}

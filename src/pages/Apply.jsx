import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, IndianRupee, MapPin } from 'lucide-react'
import ApplicationForm from '../components/jobs/ApplicationForm'
import { JobDetailSkeleton, JobNotFound } from './JobDetail'
import { useJobs, useSeo } from '../lib/hooks'
import { isDemo } from '../lib/supabase'
import { salaryLabel, expLabel } from '../data/jobs'

export default function Apply() {
  const { id } = useParams()
  const { jobs, loading } = useJobs()
  const job = jobs.find((j) => j.id === id)
  useSeo({ title: job ? `Apply: ${job.title} at ${job.company}` : 'Apply', description: 'Apply in minutes with your CV.' })

  if (loading) return <JobDetailSkeleton />
  if (!job) return <JobNotFound />

  return (
    <div className="container max-w-3xl pb-20 pt-28 md:pt-32">
      <Link to={`/jobs/${job.id}`} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" />Back to job</Link>
      <div className="card mb-6 flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient font-heading text-lg font-extrabold text-white">{job.company[0]}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">You&apos;re applying for</p>
          <h1 className="text-xl font-extrabold">{job.title}</h1>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span>{job.company}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
            <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{salaryLabel(job)}</span><span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{expLabel(job)}</span>
          </p>
        </div>
      </div>
      {isDemo && <p className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-600">Demo mode: Supabase keys are not set, so applications are stored only in your browser.</p>}
      <ApplicationForm job={job} />
    </div>
  )
}

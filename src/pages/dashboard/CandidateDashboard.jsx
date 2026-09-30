import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bell, Bookmark, Briefcase, CheckCircle2, Circle, ClipboardList, FileText, LayoutGrid, Send, Sparkles, UserRound } from 'lucide-react'
import { DashShell, StatCard, ProgressRing, StatusBadge, Tracker, EmptyBlock } from '../../components/dashboard/ui'
import { Input, TagInput } from '../../components/forms/Fields'
import UploadField from '../../components/forms/UploadField'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { fetchJobs } from '../../lib/jobsApi'
import { useAsync, useAction, openCv, APP_STATUSES, CJR_STATUSES, label, fmtDate } from '../../lib/dash'
import { demoCandidates, demoApplications, demoCandRequests, demoNotifications } from '../../lib/demoData'
import { useSeo } from '../../lib/hooks'
import { salaryLabel } from '../../data/jobs'

const PIPE = APP_STATUSES.filter(([k]) => k !== 'rejected')
const PIPE_WITH_REJECT = (rejected) => (rejected ? [...PIPE.slice(0, 4), ['rejected', 'Rejected']] : PIPE)

async function loadAll(user) {
  const [cand, apps, reqs, saved, notes, jobs] = await Promise.all([
    supabase.from('candidates').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('applications').select('*, jobs(title, company_name, location)').order('created_at', { ascending: false }),
    supabase.from('candidate_job_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('saved_jobs').select('job_id'),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
    fetchJobs(),
  ])
  return { candidate: cand.data, applications: apps.data ?? [], requests: reqs.data ?? [], savedIds: (saved.data ?? []).map((s) => s.job_id), notifications: notes.data ?? [], jobs }
}

const demo = { candidate: demoCandidates[0], applications: demoApplications.slice(0, 5), requests: demoCandRequests.slice(0, 3), savedIds: [], notifications: demoNotifications, jobs: null }

/** Simple skill-overlap "match score" between a candidate and a job. */
const matchScore = (cand, job) => {
  const mine = (cand?.skills ?? []).map((s) => s.toLowerCase())
  if (!mine.length || !job.skills.length) return 0
  return Math.round((job.skills.filter((s) => mine.includes(s.toLowerCase())).length / job.skills.length) * 100)
}

const completion = (c) => {
  const checks = [
    ['Full name', !!c?.full_name], ['Phone number', !!c?.phone], ['Current city', !!c?.city], ['Experience', c?.experience_years != null],
    ['Skills', (c?.skills?.length ?? 0) > 0], ['Qualification', !!c?.qualification], ['Expected CTC', !!c?.expected_ctc],
    ['Designation / company', !!(c?.designation || c?.current_company)], ['LinkedIn profile', !!c?.linkedin_url], ['CV uploaded', !!c?.cv_url],
  ]
  return { checks, pct: Math.round((checks.filter(([, ok]) => ok).length / checks.length) * 100) }
}

export default function CandidateDashboard() {
  useSeo({ title: 'Candidate Dashboard — HireNest', noindex: true })
  const { user, profile } = useAuth()
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') || 'overview'
  const { data, loading, reload, setData } = useAsync(() => loadAll(user), [user?.id], demo)
  const jobsList = data?.jobs

  const [demoJobs, setDemoJobs] = useState(null)
  useEffect(() => { if (!jobsList) fetchJobs().then(setDemoJobs) }, [jobsList])
  const allJobs = jobsList ?? demoJobs ?? []

  if (loading || !data) return <div className="container pt-32"><div className="skeleton h-96" /></div>
  const { candidate, applications, requests, savedIds, notifications } = data
  const { checks, pct } = completion(candidate)
  const unread = notifications.filter((n) => !n.read).length
  const saved = allJobs.filter((j) => savedIds.includes(j.id))
  const recommended = allJobs.map((j) => ({ j, score: matchScore(candidate, j) })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid }, { id: 'applications', label: 'My Applications', icon: Send, badge: 0 },
    { id: 'requests', label: 'Job Requests', icon: ClipboardList }, { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
    { id: 'cv', label: 'My CV', icon: FileText }, { id: 'profile', label: 'Profile', icon: UserRound }, { id: 'notifications', label: 'Notifications', icon: Bell, badge: unread },
  ]

  return (
    <DashShell title={`Hi, ${(candidate?.full_name || profile?.name || 'there').split(' ')[0]} 👋`} subtitle="Track your applications, requests and profile." tabs={tabs} active={tab} onChange={(t) => setSp({ tab: t })}
      aside={<Button to="/request-job" arrow>Raise a Job Request</Button>}>
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Send} label="Applications" value={applications.length} hint={`${applications.filter((a) => a.status === 'shortlisted' || a.status === 'interview').length} in progress`} />
            <StatCard icon={ClipboardList} label="Job requests" value={requests.length} tone="accent" hint={`${requests.filter((r) => r.payment_status === 'paid').length} paid`} />
            <StatCard icon={Bookmark} label="Saved jobs" value={savedIds.length} tone="cyan" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="card flex flex-col items-center p-6 text-center">
              <ProgressRing value={pct} />
              <h2 className="mt-4 font-heading text-lg font-bold">Profile completion</h2>
              <p className="text-sm text-muted">A complete profile gets matched faster.</p>
              <Button onClick={() => setSp({ tab: 'profile' })} variant="outline" className="mt-4">Complete profile</Button>
            </div>
            <div className="card p-6">
              <h2 className="font-heading text-lg font-bold">Checklist</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {checks.map(([l, ok]) => <li key={l} className={`flex items-center gap-2.5 text-sm ${ok ? '' : 'text-muted'}`}>{ok ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-line" />}{l}</li>)}
              </ul>
            </div>
          </div>
          <div>
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold"><Sparkles className="h-5 w-5 text-accent" />Recommended for you</h2>
            {recommended.length === 0 ? <p className="card p-6 text-sm text-muted">Add your skills in your profile to see jobs matched to you.</p> : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommended.map(({ j, score }) => (
                  <Link key={j.id} to={`/jobs/${j.id}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lift">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient-ui font-heading font-bold text-white">{j.company[0]}</span>
                    <div className="min-w-0 flex-1"><p className="truncate font-semibold">{j.title}</p><p className="truncate text-xs text-muted">{j.company} · {salaryLabel(j)}</p></div>
                    <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success" title="Skill match">{score}% match</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'applications' && (applications.length === 0
        ? <EmptyBlock icon={Send} title="No applications yet" text="Browse open jobs and apply in minutes." action={<Button to="/jobs" arrow>Browse jobs</Button>} />
        : <div className="space-y-4">{applications.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><h3 className="font-bold">{a.jobs?.title ?? 'Job no longer listed'}</h3><p className="text-sm text-muted">{a.jobs?.company_name} {a.jobs?.location && `· ${a.jobs.location}`} · Applied {fmtDate(a.created_at)}</p></div>
              <StatusBadge status={a.status} text={label(APP_STATUSES, a.status)} />
            </div>
            <div className="mt-5"><Tracker steps={PIPE_WITH_REJECT(a.status === 'rejected')} current={a.status === 'rejected' ? 'rejected' : a.status} rejected={a.status === 'rejected'} /></div>
          </div>))}</div>)}

      {tab === 'requests' && (requests.length === 0
        ? <EmptyBlock icon={ClipboardList} title="No job requests" text="Can't find the right job? Let our recruiters hunt for it." action={<Button to="/request-job" arrow>Raise a request</Button>} />
        : <div className="space-y-4">{requests.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-bold">{r.desired_role}</h3><p className="text-sm text-muted">{r.request_code} · {r.plan} plan · {fmtDate(r.created_at)}</p></div>
              <div className="flex gap-2"><StatusBadge status={r.status} text={label(CJR_STATUSES, r.status)} /><StatusBadge status={r.payment_status} text={`Payment: ${r.payment_status}`} /></div>
            </div>
            <div className="mt-5"><Tracker steps={CJR_STATUSES} current={r.status} /></div>
            {r.assigned_recruiter && <p className="mt-4 text-sm text-muted">Your recruiter: <b className="text-fg">{r.assigned_recruiter}</b></p>}
          </div>))}</div>)}

      {tab === 'saved' && (saved.length === 0
        ? <EmptyBlock icon={Bookmark} title="No saved jobs" text="Tap the bookmark on any job to save it here." action={<Button to="/jobs" arrow>Browse jobs</Button>} />
        : <div className="grid gap-4 md:grid-cols-2">{saved.map((j) => (
          <div key={j.id} className="card p-5"><h3 className="font-bold">{j.title}</h3><p className="text-sm text-muted">{j.company} · {j.location} · {salaryLabel(j)}</p>
            <div className="mt-4 flex gap-2"><Button to={`/jobs/${j.id}/apply`} className="!px-4 !py-2">Apply</Button><Button to={`/jobs/${j.id}`} variant="outline" className="!px-4 !py-2">View</Button></div></div>))}</div>)}

      {tab === 'cv' && <CvTab candidate={candidate} user={user} profile={profile} onChange={reload} />}
      {tab === 'profile' && <ProfileTab candidate={candidate} user={user} profile={profile} onSaved={reload} />}
      {tab === 'notifications' && <Notifications items={notifications} setData={setData} />}
    </DashShell>
  )
}

/** Creates the candidate row if this account has none yet. */
async function ensureCandidate(candidate, user, profile, patch) {
  if (candidate) return supabase.from('candidates').update(patch).eq('id', candidate.id)
  return supabase.from('candidates').insert({ user_id: user.id, email: user.email.toLowerCase(), full_name: profile?.name || user.email.split('@')[0], ...patch })
}

function CvTab({ candidate, user, profile, onChange }) {
  const act = useAction()
  const { toast } = useToast()
  return (
    <div className="card space-y-6 p-6">
      <div><h2 className="font-heading text-lg font-bold">Your CV</h2><p className="text-sm text-muted">Stored privately. Only you, our recruiters and employers you are matched with can see it.</p></div>
      {candidate?.cv_url ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
          <FileText className="h-6 w-6 text-primary" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{candidate.cv_url.split('/').pop()}</span>
          <Button variant="outline" className="!px-4 !py-2" onClick={() => openCv(candidate.cv_url, toast)}>View / Download</Button>
        </div>
      ) : <p className="rounded-xl bg-accent/10 p-4 text-sm text-accent-600">No CV on file yet.</p>}
      <div><p className="mb-2 text-sm font-medium">{candidate?.cv_url ? 'Replace CV' : 'Upload CV'}</p>
        <UploadField key={candidate?.cv_url ?? 'none'} folder="requests" value="" name=""
          onChange={async (path) => { if (path && (await act(() => ensureCandidate(candidate, user, profile, { cv_url: path }), 'CV updated'))) onChange() }} /></div>
    </div>
  )
}

function ProfileTab({ candidate, user, profile, onSaved }) {
  const act = useAction()
  const [f, setF] = useState({
    full_name: candidate?.full_name ?? profile?.name ?? '', phone: (candidate?.phone ?? '').replace('+91', ''), city: candidate?.city ?? '', experience_years: candidate?.experience_years ?? '',
    current_company: candidate?.current_company ?? '', designation: candidate?.designation ?? '', current_ctc: candidate?.current_ctc ?? '', expected_ctc: candidate?.expected_ctc ?? '',
    notice_period: candidate?.notice_period ?? '', qualification: candidate?.qualification ?? '', linkedin_url: candidate?.linkedin_url ?? '', skills: candidate?.skills ?? [],
  })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const num = (v) => (v === '' || v == null ? null : Number(v))

  const save = async (e) => {
    e.preventDefault()
    const errors = {}
    if (f.full_name.trim().length < 2) errors.full_name = 'Enter your name'
    if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) errors.phone = 'Enter a valid 10-digit number'
    if (f.linkedin_url && !/^https?:\/\/(www\.)?linkedin\.com\//i.test(f.linkedin_url)) errors.linkedin_url = 'Enter a valid LinkedIn URL'
    setErr(errors)
    if (Object.keys(errors).length) return
    const patch = { ...f, phone: f.phone ? '+91' + f.phone : null, experience_years: num(f.experience_years), current_ctc: num(f.current_ctc), expected_ctc: num(f.expected_ctc), linkedin_url: f.linkedin_url || null }
    if (await act(() => ensureCandidate(candidate, user, profile, patch), 'Profile saved')) onSaved()
  }

  return (
    <form onSubmit={save} noValidate className="card space-y-4 p-6">
      <h2 className="font-heading text-lg font-bold">Edit profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" value={f.full_name} onChange={set('full_name')} error={err.full_name} />
        <Input label="Phone" prefix="+91" inputMode="numeric" maxLength={10} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} error={err.phone} />
        <Input label="Current city" value={f.city} onChange={set('city')} />
        <Input label="Experience (years)" type="number" step="0.5" min="0" value={f.experience_years} onChange={set('experience_years')} />
        <Input label="Current company" value={f.current_company} onChange={set('current_company')} />
        <Input label="Designation" value={f.designation} onChange={set('designation')} />
        <Input label="Current CTC (LPA)" type="number" min="0" step="0.1" value={f.current_ctc} onChange={set('current_ctc')} />
        <Input label="Expected CTC (LPA)" type="number" min="0" step="0.1" value={f.expected_ctc} onChange={set('expected_ctc')} />
        <Input label="Notice period" value={f.notice_period} onChange={set('notice_period')} />
        <Input label="Highest qualification" value={f.qualification} onChange={set('qualification')} />
      </div>
      <Input label="LinkedIn URL" type="url" value={f.linkedin_url} onChange={set('linkedin_url')} error={err.linkedin_url} />
      <div><p className="mb-2 text-sm font-medium">Skills</p><TagInput label="Skills" value={f.skills} onChange={(skills) => setF({ ...f, skills })} /></div>
      <button className="btn btn-primary">Save changes</button>
    </form>
  )
}

function Notifications({ items, setData }) {
  const act = useAction()
  const markRead = async (ids) => {
    if (await act(() => supabase.from('notifications').update({ read: true }).in('id', ids))) setData((d) => ({ ...d, notifications: d.notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)) }))
  }
  const unread = items.filter((n) => !n.read).map((n) => n.id)
  if (!items.length) return <EmptyBlock icon={Bell} title="You're all caught up" text="Status updates on your applications and requests will appear here." />
  return (
    <div className="space-y-3">
      {unread.length > 0 && <button onClick={() => markRead(unread)} className="text-sm font-semibold text-primary hover:underline">Mark all as read</button>}
      {items.map((n) => (
        <button key={n.id} onClick={() => !n.read && markRead([n.id])} className={`card flex w-full items-start gap-3 p-4 text-left ${n.read ? 'opacity-70' : 'border-primary/40'}`}>
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? 'bg-line' : 'bg-accent'}`} />
          <span className="min-w-0 flex-1"><b className="block text-sm">{n.title}</b><span className="text-sm text-muted">{n.body}</span><span className="mt-1 block text-xs text-muted">{fmtDate(n.created_at)}</span></span>
        </button>
      ))}
    </div>
  )
}

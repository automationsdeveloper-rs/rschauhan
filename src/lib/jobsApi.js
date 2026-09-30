import { supabase } from './supabase'
import { jobs as seedJobs, jobDefaults } from '../data/jobs'

let cache = null // open jobs are few for an agency site → fetch once, filter in memory

const normalize = (r) => ({
  ...r,
  company: r.company ?? r.company_name,
  posted_days_ago: r.posted_days_ago ?? Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5)),
  skills: r.skills ?? [],
  responsibilities: r.responsibilities?.length ? r.responsibilities : jobDefaults.responsibilities,
  requirements: r.requirements?.length ? r.requirements : jobDefaults.requirements,
  benefits: r.benefits?.length ? r.benefits : jobDefaults.benefits,
})

export async function fetchJobs() {
  if (cache) return cache
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 450)) // let skeletons show in demo mode
    return (cache = seedJobs.map(normalize))
  }
  const { data, error } = await supabase.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false })
  if (error) throw error
  return (cache = data.map(normalize))
}

export async function fetchJob(id) {
  const all = await fetchJobs()
  return all.find((j) => j.id === id) ?? null
}

export const clearJobsCache = () => { cache = null }

/** Apply the filter state from the URL to the job list. */
export function filterJobs(jobs, f) {
  const q = f.q?.trim().toLowerCase()
  const loc = f.location?.trim().toLowerCase()
  const out = jobs.filter((j) => {
    if (q && !`${j.title} ${j.company} ${j.skills.join(' ')}`.toLowerCase().includes(q)) return false
    if (loc && !j.location.toLowerCase().includes(loc) && !(loc === 'remote' && j.work_mode === 'Remote')) return false
    if (f.types.length && !f.types.includes(j.job_type)) return false
    if (f.modes.length && !f.modes.includes(j.work_mode)) return false
    if (f.industry && j.industry !== f.industry) return false
    // ranges overlap
    if (j.exp_max < f.expMin || j.exp_min > f.expMax) return false
    if (j.salary_max < f.salMin || j.salary_min > f.salMax) return false
    if (f.posted && j.posted_days_ago > f.posted) return false
    return true
  })
  return out.sort((a, b) => (f.sort === 'salary' ? b.salary_max - a.salary_max : a.posted_days_ago - b.posted_days_ago))
}

export async function subscribeNewsletter(email) {
  if (!supabase) return { ok: true }
  const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.toLowerCase() })
  // 23505 = already subscribed → treat as success
  if (error && error.code !== '23505') throw error
  return { ok: true }
}

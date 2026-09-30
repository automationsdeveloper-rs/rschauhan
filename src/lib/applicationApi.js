import { supabase } from './supabase'

const ERRORS = {
  duplicate_application: 'You have already applied to this job with this email.',
  job_not_available: 'This job is no longer accepting applications.',
  invalid_input: 'Some details look invalid. Please review the form.',
  cv_required: 'Please upload your CV.',
}

/** Saves the application via the submit_application() RPC. Returns the application id. */
export async function submitApplication(job, v, cvPath) {
  const years = Number(v.expYears || 0) + Number(v.expMonths || 0) / 12

  if (!supabase) { // demo mode: keep it locally so the flow can be tested end-to-end
    const key = 'demo-applications'
    const list = JSON.parse(localStorage.getItem(key) || '[]')
    if (list.some((a) => a.jobId === job.id && a.email === v.email.toLowerCase())) throw new Error(ERRORS.duplicate_application)
    const id = crypto.randomUUID()
    localStorage.setItem(key, JSON.stringify([...list, { id, jobId: job.id, email: v.email.toLowerCase(), at: Date.now() }]))
    return id
  }

  const { data, error } = await supabase.rpc('submit_application', {
    p_job_id: job.id, p_full_name: v.fullName, p_email: v.email, p_phone: '+91' + v.phone, p_city: v.city,
    p_company: v.company || null, p_designation: v.designation || null,
    p_exp_years: Math.round(years * 10) / 10,
    p_current_ctc: v.currentCtc === '' ? null : Number(v.currentCtc),
    p_expected_ctc: Number(v.expectedCtc), p_notice_period: v.noticePeriod || null,
    p_skills: v.skills, p_qualification: v.qualification, p_linkedin: v.linkedin || null,
    p_cover_note: v.coverNote || null, p_cv_path: cvPath,
  })
  if (error) {
    const key = Object.keys(ERRORS).find((k) => error.message?.includes(k))
    throw new Error(key ? ERRORS[key] : 'Could not submit your application. Please try again.')
  }
  return data
}

/** Best-effort: never blocks or fails the user's flow. */
export function sendConfirmation(applicationId) {
  if (!supabase) return
  fetch('/api/send-confirmation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationId }) }).catch(() => {})
}

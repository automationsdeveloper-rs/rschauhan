// POST /api/notify-status  { kind, id }   (admin only)
// Called by the admin panel AFTER it updates a record. Reads the current state from the DB
// (never trusts client-provided text), creates an in-app notification and sends an email.
import { db, requireAdmin, rateLimit, sendMail, mailWrap, esc } from './_lib.js'

const APP = { applied: 'Applied', under_review: 'Under review', shortlisted: 'Shortlisted 🎉', interview: 'Interview stage', selected: 'Selected 🎊', rejected: 'Not selected this time' }
const REQ = { submitted: 'Submitted', in_progress: 'In progress', matches_shared: 'Matches shared', closed: 'Closed' }
const EMP = { submitted: 'Submitted', in_progress: 'In progress', profiles_shared: 'Profiles shared', closed: 'Closed' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const client = db()
  if (!(await requireAdmin(req, client))) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, 'notify', 120)) return res.status(429).end()

  const { kind, id } = req.body || {}
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return res.status(400).json({ error: 'bad id' })

  let to, name, userId, title, body
  if (kind === 'application') {
    const { data: a } = await client.from('applications').select('status, jobs(title, company_name), candidates(full_name, email, user_id)').eq('id', id).single()
    if (!a) return res.status(404).end()
    ;({ email: to, full_name: name, user_id: userId } = a.candidates)
    title = `Application update: ${APP[a.status]}`
    body = `Your application for ${a.jobs.title} at ${a.jobs.company_name} is now "${APP[a.status]}".`
  } else if (kind === 'candidate_request') {
    const { data: r } = await client.from('candidate_job_requests').select('status, request_code, desired_role, candidates(full_name, email, user_id)').eq('id', id).single()
    if (!r) return res.status(404).end()
    ;({ email: to, full_name: name, user_id: userId } = r.candidates)
    title = `Job request ${r.request_code}: ${REQ[r.status] ?? r.status}`
    body = `Your job request for "${r.desired_role}" is now "${REQ[r.status] ?? r.status}".`
  } else if (kind === 'employer_request') {
    const { data: r } = await client.from('employer_requests').select('status, request_code, employers(contact_person, email, user_id)').eq('id', id).single()
    if (!r) return res.status(404).end()
    to = r.employers.email; name = r.employers.contact_person; userId = r.employers.user_id
    title = `Hiring request ${r.request_code}: ${EMP[r.status]}`
    body = r.status === 'profiles_shared' ? 'New verified profiles have been shared with you. Review them in your dashboard.' : `Your hiring request is now "${EMP[r.status]}".`
  } else return res.status(400).json({ error: 'bad kind' })

  if (userId) await client.from('notifications').insert({ user_id: userId, title, body })
  await sendMail({ to, subject: title, html: mailWrap(`<h2 style="color:#5B4BFF">Hi ${esc(String(name).split(' ')[0])},</h2><p>${esc(body)}</p><p><a href="${esc(process.env.SITE_URL || '')}/login" style="color:#5B4BFF">Open your dashboard →</a></p>`) })
  res.status(200).json({ ok: true })
}

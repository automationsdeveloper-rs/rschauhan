// Vercel serverless function: emails the candidate + admin after an application is saved.
// The applicationId is looked up with the service-role key, so this endpoint cannot be
// used to email arbitrary addresses: it only mails the address stored on a real, recent application.
import { createClient } from '@supabase/supabase-js'

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const BRAND = process.env.VITE_SITE_NAME || 'HireNest'

async function send({ to, subject, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
  })
  if (!r.ok) throw new Error(`Resend ${r.status}`)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { applicationId } = req.body || {}
  if (!/^[0-9a-f-]{36}$/i.test(applicationId || '')) return res.status(400).json({ error: 'bad id' })

  const db = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: app } = await db.from('applications')
    .select('id, created_at, jobs(title, company_name), candidates(full_name, email)').eq('id', applicationId).maybeSingle()

  // Only for applications created in the last 10 minutes → stops replay/spam.
  if (!app || Date.now() - new Date(app.created_at).getTime() > 10 * 60 * 1000) return res.status(404).json({ error: 'not found' })

  const { full_name: name, email } = app.candidates
  const { title, company_name: company } = app.jobs
  try {
    await send({
      to: email,
      subject: `Application received — ${title} at ${company}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#5B4BFF">Thanks for applying, ${esc(name.split(' ')[0])}! 🎉</h2>
        <p>We received your application for <b>${esc(title)}</b> at <b>${esc(company)}</b>. Our recruiters will review your profile and get back to you shortly.</p>
        <p style="color:#64748b;font-size:13px">Reference: ${esc(app.id)}<br/>— Team ${esc(BRAND)}</p></div>`,
    })
    if (process.env.ADMIN_NOTIFY_EMAIL) {
      await send({ to: process.env.ADMIN_NOTIFY_EMAIL, subject: `New application: ${title}`, html: `<p><b>${esc(name)}</b> (${esc(email)}) applied for <b>${esc(title)}</b> at ${esc(company)}.</p>` })
    }
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(502).json({ error: 'email failed' })
  }
}

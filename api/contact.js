// POST /api/contact  { data, captchaToken }
// Validates with the shared schema, checks Turnstile + rate limit, stores the message and emails both sides.
import { db, rateLimit, verifyCaptcha, sendMail, mailWrap, esc, BRAND } from './_lib.js'
import { contactSchema } from '../shared/schemas.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!rateLimit(req, 'contact', 5)) return res.status(429).json({ error: 'Too many messages from this network. Please try again later.' })

  const { data, captchaToken } = req.body || {}
  if (!(await verifyCaptcha(captchaToken, req))) return res.status(400).json({ error: 'CAPTCHA verification failed. Please retry.' })
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid form data' })
  const v = parsed.data
  if (v.website) return res.status(200).json({ ok: true }) // honeypot tripped: pretend success

  const { error } = await db().from('contact_messages').insert({
    name: v.name, email: v.email.toLowerCase(), phone: v.phone ? '+91' + v.phone : null, subject: v.subject, message: v.message,
  })
  if (error) { console.error('contact insert', error); return res.status(500).json({ error: 'Could not save your message. Please try again.' }) }

  try {
    if (process.env.ADMIN_NOTIFY_EMAIL) {
      await sendMail({ to: process.env.ADMIN_NOTIFY_EMAIL, subject: `[Contact] ${v.subject} — ${v.name}`,
        html: mailWrap(`<p><b>${esc(v.name)}</b> &lt;${esc(v.email)}&gt;${v.phone ? ` · +91 ${esc(v.phone)}` : ''}</p><p><b>${esc(v.subject)}</b></p><p style="white-space:pre-wrap">${esc(v.message)}</p>`) })
    }
    await sendMail({ to: v.email, subject: `We received your message — ${BRAND}`,
      html: mailWrap(`<h2 style="color:#5B4BFF">Thanks, ${esc(v.name.split(' ')[0])}!</h2><p>We have received your message and will reply within one business day.</p><p style="color:#64748b;font-size:13px;white-space:pre-wrap">Your message:\n${esc(v.message)}</p>`) })
  } catch (e) { console.error('contact mail', e) }

  res.status(200).json({ ok: true })
}

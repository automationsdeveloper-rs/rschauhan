import { supabase, isDemo } from './supabase'

/**
 * Sends the contact form. On Vercel it goes through /api/contact (CAPTCHA + rate limit + email);
 * under plain `npm run dev` the function does not exist, so it falls back to a direct insert
 * (allowed by the contact_messages RLS policy).
 */
export async function submitContact(data, captchaToken) {
  if (isDemo) { await new Promise((r) => setTimeout(r, 700)); return { ok: true, demo: true } }
  let r
  try {
    r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, captchaToken }) })
  } catch { throw new Error('Network error. Please check your connection and try again.') }

  if (r.status === 404) {
    const { error } = await supabase.from('contact_messages').insert({
      name: data.name, email: data.email.toLowerCase(), phone: data.phone ? '+91' + data.phone : null, subject: data.subject, message: data.message,
    })
    if (error) throw new Error('Could not send your message. Please try again.')
    return { ok: true }
  }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'Could not send your message. Please try again.')
  return j
}

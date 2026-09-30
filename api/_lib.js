// Shared helpers for the payment API. Files prefixed with "_" are not exposed as routes by Vercel.
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

export const db = () => createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
export const BRAND = process.env.VITE_SITE_NAME || 'HireNest'
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function requestCode(prefix) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return `HN-${prefix}-` + Array.from(crypto.randomBytes(6), (b) => A[b % A.length]).join('')
}

// Best-effort per-instance limiter (serverless instances are ephemeral). Use Upstash/Vercel KV for a hard limit.
const hits = new Map()
export function rateLimit(req, name, max = 8, windowMs = 10 * 60 * 1000) {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim()
  const k = `${name}:${ip}`
  const now = Date.now()
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs)
  arr.push(now)
  hits.set(k, arr)
  return arr.length <= max
}

/** Cloudflare Turnstile. If no secret is configured the check is skipped. */
export async function verifyCaptcha(token, req) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token, remoteip: (req.headers['x-forwarded-for'] || '').split(',')[0] })
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
  return !!(await r.json()).success
}

/** Returns the signed-in user id from the Bearer token (or null for guests). */
export async function userFromRequest(req, client) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data } = await client.auth.getUser(token)
  return data?.user?.id ?? null
}

export async function sendMail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
  })
  if (!r.ok) console.error('Resend failed', r.status)
}

const wrap = (inner) => `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;color:#0f172a">${inner}<p style="color:#64748b;font-size:13px;margin-top:24px">— Team ${esc(BRAND)}</p></div>`

/** Idempotently marks an order paid, updates the request, and emails everyone once. */
export async function markPaid(orderId, paymentId) {
  const client = db()
  const { data: pay } = await client.from('payments').select('*').eq('razorpay_order_id', orderId).maybeSingle()
  if (!pay) return { ok: false, reason: 'unknown order' }
  if (pay.status === 'paid') return { ok: true, already: true, pay }

  await client.from('payments').update({ status: 'paid', razorpay_payment_id: paymentId }).eq('id', pay.id)

  const isCand = pay.type === 'candidate_request'
  const table = isCand ? 'candidate_job_requests' : 'employer_requests'
  await client.from(table).update({ payment_status: 'paid' }).eq('id', pay.reference_id)

  // emails (failures never break the payment flow)
  try {
    const { data: r } = isCand
      ? await client.from(table).select('request_code, plan, desired_role, candidates(full_name, email)').eq('id', pay.reference_id).single()
      : await client.from(table).select('request_code, plan, employers(company_name, contact_person, email)').eq('id', pay.reference_id).single()
    const who = isCand ? r.candidates : r.employers
    const name = isCand ? who.full_name : who.contact_person
    const amount = `₹${Number(pay.amount).toLocaleString('en-IN')}`
    const next = isCand
      ? 'A recruiter will review your profile and start matching you with openings. You will hear from us within 24 hours.'
      : 'Our recruiter will contact you within 24 hours and first verified profiles will follow within 48 hours.'
    await sendMail({
      to: who.email,
      subject: `Payment received — request ${r.request_code}`,
      html: wrap(`<h2 style="color:#5B4BFF">Thank you, ${esc(String(name).split(' ')[0])}!</h2><p>We received your payment of <b>${amount}</b> (incl. GST) for the <b>${esc(r.plan)}</b> plan.</p><p>${next}</p><p style="font-size:13px;color:#64748b">Request ID: <b>${esc(r.request_code)}</b><br/>Payment ID: ${esc(paymentId)}</p>`),
    })
    if (process.env.ADMIN_NOTIFY_EMAIL) {
      await sendMail({ to: process.env.ADMIN_NOTIFY_EMAIL, subject: `New paid ${isCand ? 'job' : 'hiring'} request ${r.request_code}`, html: wrap(`<p><b>${esc(name)}</b> (${esc(who.email)}) paid ${amount} for <b>${esc(r.plan)}</b>. Request <b>${esc(r.request_code)}</b>.</p>`) })
    }
  } catch (e) { console.error('email error', e) }
  return { ok: true, pay }
}

/** Returns the user id if the Bearer token belongs to an admin, else null. */
export async function requireAdmin(req, client) {
  const uid = await userFromRequest(req, client)
  if (!uid) return null
  const { data } = await client.from('users').select('role').eq('id', uid).maybeSingle()
  return data?.role === 'admin' ? uid : null
}

export const mailWrap = wrap

// POST /api/verify-payment  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Called right after Razorpay Checkout succeeds. The webhook is the backup if the browser closes early.
import crypto from 'node:crypto'
import { markPaid, rateLimit } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!rateLimit(req, 'verify', 20)) return res.status(429).json({ error: 'Too many requests' })

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: sig } = req.body || {}
  if (![orderId, paymentId, sig].every((s) => typeof s === 'string' && s.length < 200)) return res.status(400).json({ error: 'Bad request' })

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex')
  const a = Buffer.from(expected), b = Buffer.from(sig)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ error: 'Payment signature mismatch' })

  const r = await markPaid(orderId, paymentId)
  if (!r.ok) return res.status(404).json({ error: 'Order not found' })
  res.status(200).json({ ok: true })
}

// POST /api/razorpay-webhook: the authoritative payment confirmation.
// Dashboard > Settings > Webhooks: URL https://<your-domain>/api/razorpay-webhook,
// events: payment.captured, order.paid, payment.failed, secret = RAZORPAY_WEBHOOK_SECRET.
import crypto from 'node:crypto'
import { db, markPaid } from './_lib.js'

export const config = { api: { bodyParser: false } } // signature is computed over the RAW body

const readRaw = (req) => new Promise((resolve, reject) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c)).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject)
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const raw = await readRaw(req)
  const sig = req.headers['x-razorpay-signature'] || ''
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex')
  const a = Buffer.from(expected), b = Buffer.from(String(sig))
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ error: 'Invalid signature' })

  const event = JSON.parse(raw.toString('utf8'))
  const payment = event.payload?.payment?.entity
  try {
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const orderId = payment?.order_id || event.payload?.order?.entity?.id
      await markPaid(orderId, payment?.id || 'webhook')
    } else if (event.event === 'payment.failed' && payment?.order_id) {
      await db().from('payments').update({ status: 'failed' }).eq('razorpay_order_id', payment.order_id).neq('status', 'paid')
    }
  } catch (e) {
    console.error('webhook error', e)
    return res.status(500).end() // Razorpay retries
  }
  res.status(200).json({ ok: true })
}

import { supabase } from './supabase'

async function post(url, body, withAuth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (withAuth && supabase) {
    const { data } = await supabase.auth.getSession()
    if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`
  }
  let r
  try { r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }) } catch { throw new Error('Network error. Check your connection and try again.') }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || (r.status === 404 ? 'Payment service is not available in this environment (run with `vercel dev` or deploy).' : 'Something went wrong. Please try again.'))
  return j
}

/** Server validates the form, stores the request as "pending" and creates the Razorpay order. */
export const createOrder = (kind, data, captchaToken) => post('/api/create-order', { kind, data, captchaToken }, true)
export const verifyPayment = (resp) => post('/api/verify-payment', resp)

let scriptPromise
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  return (scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = resolve
    s.onerror = () => { scriptPromise = null; reject(new Error('Could not load Razorpay. Check your connection.')) }
    document.body.appendChild(s)
  }))
}

/** Opens Razorpay Checkout. Resolves with the payment response; rejects with {dismissed:true} or Error. */
export async function payWithRazorpay({ order, prefill, description, brand }) {
  await loadRazorpay()
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId, amount: order.amount, currency: 'INR', order_id: order.orderId, name: brand, description, prefill,
      theme: { color: '#5B4BFF' },
      handler: resolve,
      modal: { ondismiss: () => reject({ dismissed: true }) },
    })
    rzp.on('payment.failed', (e) => reject(new Error(e.error?.description || 'Payment failed. Please try again.')))
    rzp.open()
  })
}

import { useRef, useState } from 'react'
import { isDemo } from './supabase'
import { createOrder, payWithRazorpay, verifyPayment } from './paymentApi'
import { useToast } from '../context/ToastContext'
import { site } from '../config/site'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * run() → { code, demo? } on success, or null if the user cancelled / it failed (a toast is shown).
 * The server order is reused when the user retries with unchanged data, so retries never create duplicate requests.
 */
export function useCheckout(kind) {
  const [busy, setBusy] = useState(false)
  const pending = useRef(null)
  const { toast } = useToast()

  const run = async ({ data, captchaToken, prefill, description }) => {
    setBusy(true)
    try {
      if (isDemo) {
        await sleep(1200)
        return { code: `HN-${kind === 'candidate' ? 'JR' : 'HR'}-DEMO${Math.floor(1000 + Math.random() * 9000)}`, demo: true }
      }
      const key = JSON.stringify(data)
      if (!pending.current || pending.current.key !== key) pending.current = { key, order: await createOrder(kind, data, captchaToken) }
      const { order } = pending.current
      if (order.free) return { code: order.requestCode }

      const resp = await payWithRazorpay({ order, prefill, description, brand: site.name })
      await verifyPayment(resp)
      return { code: order.requestCode }
    } catch (e) {
      if (e?.dismissed) toast('Payment cancelled. You can retry whenever you are ready.', 'info')
      else toast(e.message || 'Payment failed. Please try again.', 'error')
      return null
    } finally {
      setBusy(false)
    }
  }
  return { run, busy }
}

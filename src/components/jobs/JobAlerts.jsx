import { useState } from 'react'
import { motion } from 'framer-motion'
import { BellRing, Check, Loader2 } from 'lucide-react'
import { subscribeAlerts } from '../../lib/jobsApi'
import { useToast } from '../../context/ToastContext'
import { useLang } from '../../i18n'

/** Email job alerts by role + location → newsletter_subscribers (role_interest, location_interest). */
export default function JobAlerts({ defaultRole = '', defaultLocation = '' }) {
  const { d } = useLang()
  const { toast } = useToast()
  const [f, setF] = useState({ email: '', role: defaultRole, location: defaultLocation })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast(d.alerts.invalid, 'error')
    setBusy(true)
    try { await subscribeAlerts(f.email, f.role.trim(), f.location.trim()); setDone(true) }
    catch { toast(d.alerts.error, 'error') }
    finally { setBusy(false) }
  }

  return (
    <section aria-labelledby="alerts-title" className="card relative mt-12 overflow-hidden p-6 md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden><BellRing className="h-6 w-6" /></span>
          <div><h2 id="alerts-title" className="text-xl font-extrabold">{d.alerts.title}</h2><p className="mt-1 text-sm text-muted">{d.alerts.text}</p></div>
        </div>
        {done ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className="flex items-center gap-2 rounded-xl bg-success/10 p-4 text-sm font-medium text-success"><Check className="h-5 w-5" aria-hidden />{d.alerts.done}</motion.p>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-2 sm:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_1fr_1.2fr_auto]">
            <label className="sr-only" htmlFor="alert-role">{d.alerts.role}</label>
            <input id="alert-role" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder={d.alerts.role} className="input !py-2.5" maxLength={120} />
            <label className="sr-only" htmlFor="alert-location">{d.alerts.location}</label>
            <input id="alert-location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder={d.alerts.location} className="input !py-2.5" maxLength={120} />
            <label className="sr-only" htmlFor="alert-email">{d.alerts.email}</label>
            <input id="alert-email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder={d.alerts.email} className="input !py-2.5 sm:col-span-2 lg:col-span-1" />
            <button disabled={busy} className="btn btn-primary !py-2.5 sm:col-span-2 lg:col-span-1">{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : d.alerts.cta}</button>
          </form>
        )}
      </div>
    </section>
  )
}

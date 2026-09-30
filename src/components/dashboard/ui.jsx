import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Search, X } from 'lucide-react'

/** Page frame: sidebar on desktop, scrollable pill tabs on mobile. tabs = [{id,label,icon,badge}] */
export function DashShell({ title, subtitle, tabs, active, onChange, children, aside }) {
  return (
    <div className="container pb-20 pt-28 md:pt-32">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>{subtitle && <p className="mt-1 text-muted">{subtitle}</p>}</div>
        {aside}
      </header>
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Dashboard sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:sticky lg:top-24 lg:mx-0 lg:h-fit lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => onChange(t.id)} aria-current={active === t.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active === t.id ? 'bg-brand-gradient text-white shadow-glow' : 'text-muted hover:bg-primary/10 hover:text-primary'}`}>
              {t.icon && <t.icon className="h-4 w-4" />}{t.label}
              {t.badge > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${active === t.id ? 'bg-white/25' : 'bg-accent text-white'}`}>{t.badge}</span>}
            </button>
          ))}
        </nav>
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="min-w-0">{children}</motion.div>
      </div>
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }) {
  const tones = { primary: 'bg-primary/10 text-primary', success: 'bg-success/10 text-success', accent: 'bg-accent/10 text-accent-600', cyan: 'bg-secondary/15 text-secondary-600' }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between"><p className="text-sm font-medium text-muted">{label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-4.5 w-4.5" /></span></div>
      <p className="mt-3 font-heading text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function ProgressRing({ value, size = 120 }) {
  const r = 48, c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`Profile ${value}% complete`}>
      <svg viewBox="0 0 120 120" className="-rotate-90" width={size} height={size}>
        <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5B4BFF" /><stop offset="1" stopColor="#22D3EE" /></linearGradient></defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" className="text-line" strokeWidth="10" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke="url(#ring)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <span className="absolute font-heading text-2xl font-extrabold">{value}%</span>
    </div>
  )
}

const TONES = {
  applied: 'bg-primary/10 text-primary', under_review: 'bg-secondary/15 text-secondary-600', shortlisted: 'bg-accent/15 text-accent-600', interview: 'bg-accent/15 text-accent-600',
  selected: 'bg-success/15 text-success', rejected: 'bg-danger/10 text-danger',
  submitted: 'bg-primary/10 text-primary', in_progress: 'bg-secondary/15 text-secondary-600', matches_shared: 'bg-accent/15 text-accent-600', profiles_shared: 'bg-accent/15 text-accent-600', closed: 'bg-line text-muted',
  paid: 'bg-success/15 text-success', pending: 'bg-accent/15 text-accent-600', failed: 'bg-danger/10 text-danger', refunded: 'bg-line text-muted', created: 'bg-line text-muted',
  shared: 'bg-primary/10 text-primary', open: 'bg-success/15 text-success',
}
export function StatusBadge({ status, text }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TONES[status] ?? 'bg-line text-muted'}`}>{text ?? String(status).replace(/_/g, ' ')}</span>
}

/** Step tracker. steps = [[key,label]]; `rejected` shows the final step as failed. */
export function Tracker({ steps, current, rejected }) {
  const idx = Math.max(0, steps.findIndex(([k]) => k === current))
  return (
    <ol className="flex w-full items-start" aria-label="Progress">
      {steps.map(([k, l], i) => {
        const failed = rejected && i === steps.length - 1
        const done = rejected ? i < steps.length - 1 : i < idx || (i === idx && i === steps.length - 1)
        const now = !rejected && i === idx && !done
        return (
          <li key={k} className="relative flex flex-1 flex-col items-center text-center" aria-current={now ? 'step' : undefined}>
            {i > 0 && <span className={`absolute right-1/2 top-3.5 -z-0 h-0.5 w-full ${i <= idx ? (failed ? 'bg-danger' : 'bg-primary') : 'bg-line'}`} />}
            <span className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold ${failed ? 'border-danger bg-danger text-white' : done ? 'border-primary bg-primary text-white' : now ? 'border-primary bg-surface text-primary shadow-glow' : 'border-line bg-surface text-muted'}`}>
              {failed ? <X className="h-3.5 w-3.5" /> : done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`mt-1.5 text-[10px] font-semibold leading-tight sm:text-xs ${now || done || failed ? 'text-fg' : 'text-muted'}`}>{l}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.97 }}
            className={`card relative max-h-[90vh] w-full overflow-y-auto p-6 md:p-8 ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
            <div className="mb-5 flex items-start justify-between gap-4"><h2 className="text-xl font-extrabold md:text-2xl">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line hover:border-primary"><X className="h-4 w-4" /></button></div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function EmptyBlock({ icon: Icon, title, text, action }) {
  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-7 w-7" /></span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export const SearchBox = ({ value, onChange, placeholder = 'Search…' }) => (
  <label className="flex min-w-[200px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
    <Search className="h-4 w-4 text-primary" /><span className="sr-only">{placeholder}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm outline-none" />
  </label>
)

/** columns: [{ header, render(row), className }] */
export function DataTable({ columns, rows, loading, empty = 'Nothing here yet.', rowKey = (r) => r.id }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead><tr className="border-b border-line bg-primary/[0.03] text-xs uppercase tracking-wider text-muted">
          {columns.map((c) => <th key={c.header} scope="col" className={`whitespace-nowrap px-4 py-3 font-semibold ${c.className ?? ''}`}>{c.header}</th>)}
        </tr></thead>
        <tbody>
          {loading ? Array.from({ length: 5 }, (_, i) => <tr key={i} className="border-b border-line">{columns.map((c) => <td key={c.header} className="px-4 py-3.5"><div className="skeleton h-4 w-full max-w-[140px]" /></td>)}</tr>)
            : rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted">{empty}</td></tr>
            : rows.map((r) => (
              <tr key={rowKey(r)} className="border-b border-line last:border-0 transition hover:bg-primary/[0.04]">
                {columns.map((c) => <td key={c.header} className={`px-4 py-3.5 align-middle ${c.className ?? ''}`}>{c.render(r)}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export const Select = ({ value, onChange, options, label, className = '' }) => (
  <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} aria-label={label} className={`rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}>
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
)

export const Field = ({ label, children }) => <div><dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt><dd className="mt-0.5 text-sm">{children || '—'}</dd></div>

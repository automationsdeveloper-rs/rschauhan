import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { useLang } from '../../i18n'

export default function EmptyState({ onReset }) {
  const { d } = useLang()
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card relative overflow-hidden px-6 py-14 text-center md:py-20" role="status">
      <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <motion.svg viewBox="0 0 160 140" className="relative mx-auto h-36 w-40" aria-hidden animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}>
        <defs><linearGradient id="es" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5B4BFF" /><stop offset="1" stopColor="#22D3EE" /></linearGradient></defs>
        <rect x="22" y="30" width="86" height="88" rx="12" fill="currentColor" opacity=".08" />
        <rect x="34" y="46" width="44" height="7" rx="3.5" fill="currentColor" opacity=".25" />
        <rect x="34" y="62" width="60" height="7" rx="3.5" fill="currentColor" opacity=".15" />
        <rect x="34" y="78" width="36" height="7" rx="3.5" fill="currentColor" opacity=".15" />
        <motion.g animate={{ rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} style={{ originX: '95px', originY: '85px' }}>
          <circle cx="95" cy="78" r="26" fill="none" stroke="url(#es)" strokeWidth="8" />
          <path d="M114 98l22 22" stroke="url(#es)" strokeWidth="10" strokeLinecap="round" />
          <path d="M86 70l18 18M104 70L86 88" stroke="#FF7A45" strokeWidth="5" strokeLinecap="round" />
        </motion.g>
      </motion.svg>
      <h2 className="relative mt-4 text-2xl font-extrabold md:text-3xl">{d.jobs.emptyTitle}</h2>
      <p className="relative mx-auto mt-3 max-w-md text-muted">{d.jobs.emptyText}</p>
      <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button to="/request-job" size="lg" arrow>{d.jobs.emptyCta}</Button>
        <button onClick={onReset} className="btn btn-ghost">{d.jobs.clear}</button>
      </div>
    </motion.div>
  )
}

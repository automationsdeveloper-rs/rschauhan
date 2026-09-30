import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Home, Search } from 'lucide-react'
import { useSeo } from '../lib/hooks'
import { site } from '../config/site'

const digit = { hidden: { y: 40, opacity: 0, rotate: -8 }, show: (i) => ({ y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 160, damping: 14, delay: i * 0.12 } }) }

export default function NotFound() {
  useSeo({ title: `Page not found — ${site.name}`, noindex: true })
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  return (
    <section className="relative grid min-h-[85vh] place-items-center overflow-hidden px-4 pt-24">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 animate-blob rounded-full bg-primary/25 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 animate-blob rounded-full bg-secondary/25 blur-[100px] [animation-delay:-7s]" aria-hidden />
      <div className="relative w-full max-w-xl text-center">
        <p className="text-gradient flex justify-center font-heading text-8xl font-extrabold md:text-9xl" aria-label="404">
          {['4', '0', '4'].map((c, i) => <motion.span key={i} custom={i} variants={digit} initial="hidden" animate="show" className={`inline-block ${i === 1 ? 'animate-float' : ''}`} aria-hidden>{c}</motion.span>)}
        </p>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">This page took a wrong turn</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">The page you are looking for does not exist or has moved. Try searching for a job instead.</p>

        <form onSubmit={(e) => { e.preventDefault(); navigate(q.trim() ? `/jobs?q=${encodeURIComponent(q.trim())}` : '/jobs') }} role="search" className="glass mx-auto mt-8 flex max-w-md gap-2 rounded-2xl p-2">
          <label htmlFor="nf-search" className="sr-only">Search jobs</label>
          <span className="flex flex-1 items-center gap-2 rounded-xl bg-surface/70 px-3"><Search className="h-4 w-4 text-primary" aria-hidden /><input id="nf-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs, e.g. React developer" className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted/70" /></span>
          <button className="btn btn-primary !py-2.5">Search</button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-outline"><Home className="h-4 w-4" aria-hidden />Back to home</Link>
          <Link to="/jobs" className="btn btn-ghost"><Briefcase className="h-4 w-4" aria-hidden />Browse all jobs</Link>
        </div>
      </div>
    </section>
  )
}

import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import FilterPanel, { RANGE } from '../components/jobs/FilterPanel'
import JobListCard, { JobCardSkeleton } from '../components/jobs/JobListCard'
import EmptyState from '../components/jobs/EmptyState'
import { useJobs, useSavedJobs, useSeo } from '../lib/hooks'
import { filterJobs } from '../lib/jobsApi'
import { useToast } from '../context/ToastContext'

const PAGE_SIZE = 8
const list = (v) => (v ? v.split(',').filter(Boolean) : [])

function parse(sp) {
  let expMin = +sp.get('expMin') || 0
  let expMax = sp.has('expMax') ? +sp.get('expMax') : RANGE.expMax
  if (sp.get('exp')) { const [a, b] = sp.get('exp').split('-').map(Number); expMin = a || 0; expMax = b || RANGE.expMax } // from hero search
  return {
    q: sp.get('q') ?? '', location: sp.get('location') ?? '', types: list(sp.get('types')), modes: list(sp.get('modes')),
    industry: sp.get('industry') ?? '', posted: +sp.get('posted') || 0, sort: sp.get('sort') ?? 'latest',
    expMin, expMax: Math.min(expMax, RANGE.expMax), salMin: +sp.get('salMin') || 0, salMax: sp.has('salMax') ? +sp.get('salMax') : RANGE.salMax,
    page: Math.max(1, +sp.get('page') || 1),
  }
}

export default function Jobs() {
  useSeo({ title: 'Find Jobs — HireNest', description: 'Browse verified job openings across IT, sales, banking, healthcare and more. Apply in minutes.' })
  const [sp, setSp] = useSearchParams()
  const f = useMemo(() => parse(sp), [sp])
  const { jobs, loading, error } = useJobs()
  const { isSaved, toggle } = useSavedJobs()
  const { toast } = useToast()
  const [drawer, setDrawer] = useState(false)

  const set = (patch) => {
    const next = new URLSearchParams(sp)
    Object.entries(patch).forEach(([k, v]) => {
      const empty = v === '' || v === 0 || v == null || (Array.isArray(v) && !v.length) || (k === 'expMax' && v === RANGE.expMax) || (k === 'salMax' && v === RANGE.salMax) || (k === 'sort' && v === 'latest')
      if (empty) next.delete(k); else next.set(k, Array.isArray(v) ? v.join(',') : v)
    })
    if (!('page' in patch)) next.delete('page')
    if (sp.get('exp')) { // hero-search shorthand "1-3": convert to explicit params so the sliders stay in sync
      next.delete('exp')
      if (!('expMin' in patch)) next.set('expMin', f.expMin)
      if (!('expMax' in patch)) next.set('expMax', f.expMax)
    }
    setSp(next, { replace: true })
  }
  const reset = () => setSp({}, { replace: true })
  const dirty = sp.toString() !== '' && !(sp.size === 1 && sp.has('sort'))

  const results = useMemo(
    () => filterJobs(jobs, { ...f, expMax: f.expMax >= RANGE.expMax ? Infinity : f.expMax, salMax: f.salMax >= RANGE.salMax ? Infinity : f.salMax }),
    [jobs, f]
  )
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const page = Math.min(f.page, pages)
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const onSave = (id) => { toggle(id); toast(isSaved(id) ? 'Removed from saved jobs' : 'Job saved', 'success') }

  return (
    <div className="container pb-20 pt-28 md:pt-32">
      <header className="mb-8">
        <span className="eyebrow">Find jobs</span>
        <h1 className="text-3xl font-extrabold md:text-5xl">Explore open positions</h1>
        <p className="mt-3 text-muted">{loading ? 'Loading jobs…' : `${results.length} job${results.length === 1 ? '' : 's'} match your search`}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* desktop sidebar */}
        <aside className="card sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] overflow-y-auto p-5 lg:block"><FilterPanel f={f} set={set} reset={reset} dirty={dirty} /></aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <button onClick={() => setDrawer(true)} className="btn btn-outline lg:hidden"><SlidersHorizontal className="h-4 w-4" />Filters{dirty && <span className="h-2 w-2 rounded-full bg-accent" />}</button>
            <label className="ml-auto flex items-center gap-2 text-sm text-muted">Sort by
              <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} className="input !w-auto !py-2">
                <option value="latest">Latest</option>
                <option value="salary">Salary: high to low</option>
              </select>
            </label>
          </div>

          {error ? (
            <div className="card p-10 text-center"><p className="font-semibold">We couldn&apos;t load jobs.</p><p className="mt-1 text-sm text-muted">Please refresh the page or try again in a moment.</p></div>
          ) : loading ? (
            <div className="grid gap-4">{Array.from({ length: 4 }, (_, i) => <JobCardSkeleton key={i} />)}</div>
          ) : results.length === 0 ? (
            <EmptyState onReset={reset} />
          ) : (
            <>
              <div className="grid gap-4"><AnimatePresence mode="popLayout">{shown.map((j) => <JobListCard key={j.id} job={j} saved={isSaved(j.id)} onToggleSave={onSave} />)}</AnimatePresence></div>
              {pages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  <button disabled={page === 1} onClick={() => { set({ page: page - 1 }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Previous page" className="grid h-10 w-10 place-items-center rounded-xl border border-line disabled:opacity-40 hover:border-primary"><ChevronLeft className="h-4 w-4" /></button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => { set({ page: n }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-current={n === page ? 'page' : undefined}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${n === page ? 'bg-brand-gradient text-white shadow-glow' : 'border border-line hover:border-primary hover:text-primary'}`}>{n}</button>
                  ))}
                  <button disabled={page === pages} onClick={() => { set({ page: page + 1 }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Next page" className="grid h-10 w-10 place-items-center rounded-xl border border-line disabled:opacity-40 hover:border-primary"><ChevronRight className="h-4 w-4" /></button>
                </nav>
              )}
              <p className="mt-10 text-center text-sm text-muted">Can&apos;t see the right role? <Link to="/request-job" className="font-semibold text-primary hover:underline">Raise a Job Request</Link> and we&apos;ll find it for you.</p>
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-bg p-5 shadow-2xl" role="dialog" aria-label="Filters">
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="mb-2 ml-auto grid h-9 w-9 place-items-center rounded-lg border border-line"><X className="h-4 w-4" /></button>
              <FilterPanel f={f} set={set} reset={reset} dirty={dirty} />
              <button onClick={() => setDrawer(false)} className="btn btn-primary sticky bottom-0 mt-6 w-full">Show {results.length} jobs</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

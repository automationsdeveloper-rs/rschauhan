import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import FilterPanel, { RANGE } from '../components/jobs/FilterPanel'
import JobListCard, { JobCardSkeleton } from '../components/jobs/JobListCard'
import EmptyState from '../components/jobs/EmptyState'
import JobAlerts from '../components/jobs/JobAlerts'
import { useJobs, useSavedJobs, useSeo } from '../lib/hooks'
import { filterJobs } from '../lib/jobsApi'
import { useToast } from '../context/ToastContext'
import { useLang } from '../i18n'

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
  const { d, t } = useLang()
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
  const goPage = (n) => { set({ page: n }); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const onSave = (id) => { toggle(id); toast(isSaved(id) ? 'Removed from saved jobs' : 'Job saved', 'success') }

  return (
    <div className="container pb-20 pt-28 md:pt-32">
      <header className="mb-8">
        <span className="eyebrow">{d.jobs.eyebrow}</span>
        <h1 className="text-3xl font-extrabold md:text-5xl">{d.jobs.title}</h1>
        <p className="mt-3 text-muted" aria-live="polite">{loading ? d.jobs.loading : results.length === 1 ? d.jobs.one : t('jobs.many', { n: results.length })}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* desktop sidebar */}
        <aside className="card sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] overflow-y-auto p-5 lg:block" aria-label={d.jobs.filters}><FilterPanel f={f} set={set} reset={reset} dirty={dirty} /></aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <button onClick={() => setDrawer(true)} className="btn btn-outline lg:hidden" aria-expanded={drawer}><SlidersHorizontal className="h-4 w-4" aria-hidden />{d.jobs.filters}{dirty && <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />}</button>
            <label className="ml-auto flex items-center gap-2 text-sm text-muted">{d.jobs.sortBy}
              <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} className="input !w-auto !py-2">
                <option value="latest">{d.jobs.latest}</option>
                <option value="salary">{d.jobs.salary}</option>
              </select>
            </label>
          </div>

          {error ? (
            <div className="card p-10 text-center" role="alert"><p className="font-semibold">{d.jobs.loadError}</p><p className="mt-1 text-sm text-muted">{d.jobs.loadErrorSub}</p></div>
          ) : loading ? (
            <div className="grid gap-4" aria-busy="true">{Array.from({ length: 4 }, (_, i) => <JobCardSkeleton key={i} />)}</div>
          ) : results.length === 0 ? (
            <EmptyState onReset={reset} />
          ) : (
            <>
              <div className="grid gap-4"><AnimatePresence mode="popLayout">{shown.map((j) => <JobListCard key={j.id} job={j} saved={isSaved(j.id)} onToggleSave={onSave} />)}</AnimatePresence></div>
              {pages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  <button disabled={page === 1} onClick={() => goPage(page - 1)} aria-label="Previous page" className="grid h-10 w-10 place-items-center rounded-xl border border-line disabled:opacity-40 hover:border-primary"><ChevronLeft className="h-4 w-4" aria-hidden /></button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => goPage(n)} aria-current={n === page ? 'page' : undefined} aria-label={`Page ${n}`}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${n === page ? 'bg-brand-gradient-ui text-white shadow-glow' : 'border border-line hover:border-primary hover:text-primary'}`}>{n}</button>
                  ))}
                  <button disabled={page === pages} onClick={() => goPage(page + 1)} aria-label="Next page" className="grid h-10 w-10 place-items-center rounded-xl border border-line disabled:opacity-40 hover:border-primary"><ChevronRight className="h-4 w-4" aria-hidden /></button>
                </nav>
              )}
              <p className="mt-10 text-center text-sm text-muted">{d.jobs.cantSee} <Link to="/request-job" className="font-semibold text-primary hover:underline">{d.jobs.raise}</Link> {d.jobs.weFind}</p>
            </>
          )}
        </div>
      </div>

      <JobAlerts defaultRole={f.q} defaultLocation={f.location} />

      {/* mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-bg p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label={d.jobs.filters}>
              <button onClick={() => setDrawer(false)} aria-label={d.jobs.closeFilters} className="mb-2 ml-auto grid h-9 w-9 place-items-center rounded-lg border border-line"><X className="h-4 w-4" aria-hidden /></button>
              <FilterPanel f={f} set={set} reset={reset} dirty={dirty} />
              <button onClick={() => setDrawer(false)} className="btn btn-primary sticky bottom-0 mt-6 w-full">{t('jobs.show', { n: results.length })}</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

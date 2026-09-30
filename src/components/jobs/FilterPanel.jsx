import { Search, MapPin, RotateCcw } from 'lucide-react'
import { industries } from '../../config/site'

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const MODES = ['Onsite', 'Hybrid', 'Remote']
const POSTED = [['', 'Any time'], ['1', 'Last 24 hours'], ['3', 'Last 3 days'], ['7', 'Last 7 days'], ['30', 'Last 30 days']]

export const RANGE = { expMax: 20, salMax: 50 }

function Group({ title, children }) {
  return <div className="border-t border-line pt-5"><h3 className="mb-3 font-heading text-sm font-bold">{title}</h3>{children}</div>
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-muted transition hover:text-fg">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[#5B4BFF]" />{label}
    </label>
  )
}

function Range({ label, unit, max, lo, hi, onChange }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><span className="text-muted">{label}</span><b>{lo}–{hi}{hi >= max ? '+' : ''} {unit}</b></div>
      <input type="range" min={0} max={max} value={lo} aria-label={`${label} minimum`} onChange={(e) => onChange(Math.min(+e.target.value, hi), hi)} className="w-full accent-[#5B4BFF]" />
      <input type="range" min={0} max={max} value={hi} aria-label={`${label} maximum`} onChange={(e) => onChange(lo, Math.max(+e.target.value, lo))} className="w-full accent-[#22D3EE]" />
    </div>
  )
}

export default function FilterPanel({ f, set, reset, dirty }) {
  const toggle = (key, v) => set({ [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] })
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-extrabold">Filters</h2>
        {dirty && <button onClick={reset} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"><RotateCcw className="h-3 w-3" />Reset</button>}
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <Search className="h-4 w-4 text-primary" /><span className="sr-only">Search jobs</span>
        <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Title, company or skill" className="w-full bg-transparent text-sm outline-none" />
      </label>
      <label className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <MapPin className="h-4 w-4 text-primary" /><span className="sr-only">Location</span>
        <input value={f.location} onChange={(e) => set({ location: e.target.value })} placeholder="City or 'Remote'" className="w-full bg-transparent text-sm outline-none" />
      </label>

      <Group title="Job type">{TYPES.map((t) => <Check key={t} label={t} checked={f.types.includes(t)} onChange={() => toggle('types', t)} />)}</Group>
      <Group title="Work mode">{MODES.map((t) => <Check key={t} label={t} checked={f.modes.includes(t)} onChange={() => toggle('modes', t)} />)}</Group>
      <Group title="Experience"><Range label="Years" unit="yrs" max={RANGE.expMax} lo={f.expMin} hi={f.expMax} onChange={(a, b) => set({ expMin: a, expMax: b })} /></Group>
      <Group title="Salary"><Range label="Per year" unit="LPA" max={RANGE.salMax} lo={f.salMin} hi={f.salMax} onChange={(a, b) => set({ salMin: a, salMax: b })} /></Group>
      <Group title="Industry">
        <select value={f.industry} onChange={(e) => set({ industry: e.target.value })} aria-label="Industry" className="input !py-2.5">
          <option value="">All industries</option>
          {industries.map((i) => <option key={i.name}>{i.name}</option>)}
        </select>
      </Group>
      <Group title="Date posted">
        <select value={f.posted} onChange={(e) => set({ posted: +e.target.value || 0 })} aria-label="Date posted" className="input !py-2.5">
          {POSTED.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Group>
    </div>
  )
}

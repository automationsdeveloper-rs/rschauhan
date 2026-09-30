import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, Briefcase, ClipboardList, IndianRupee, Send, Table2, Users } from 'lucide-react'
import { StatCard } from '../../components/dashboard/ui'
import { supabase } from '../../lib/supabase'
import { useAsync, APP_STATUSES, money } from '../../lib/dash'
import { demoApplications, demoCandidates, demoCandRequests, demoEmployerRequests, demoPayments } from '../../lib/demoData'

const DAYS = 30
async function load() {
  const since = new Date(Date.now() - DAYS * 864e5).toISOString()
  const count = (t) => supabase.from(t).select('*', { count: 'exact', head: true }).then((r) => r.count ?? 0)
  const [candidates, applications, jobRequests, employerRequests, pays, apps] = await Promise.all([
    count('candidates'), count('applications'), count('candidate_job_requests'), count('employer_requests'),
    supabase.from('payments').select('amount, created_at').eq('status', 'paid').limit(5000),
    supabase.from('applications').select('created_at, status').limit(5000),
  ])
  return { counts: { candidates, applications, jobRequests, employerRequests }, payments: pays.data ?? [], apps: apps.data ?? [] }
}
const demo = {
  counts: { candidates: demoCandidates.length, applications: demoApplications.length, jobRequests: demoCandRequests.length, employerRequests: demoEmployerRequests.length },
  payments: demoPayments, apps: demoApplications,
}

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)
const dayLabel = (k) => new Date(k).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

function series(rows, pick) {
  const map = {}
  for (let i = DAYS - 1; i >= 0; i--) map[dayKey(Date.now() - i * 864e5)] = 0
  rows.forEach((r) => { const k = dayKey(r.created_at); if (k in map) map[k] += pick(r) })
  return Object.entries(map).map(([k, v]) => ({ date: dayLabel(k), value: v }))
}

function Tip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null
  return <div className="card px-3 py-2 text-xs shadow-lift"><p className="text-muted">{label}</p><p className="font-heading text-sm font-bold">{fmt(payload[0].value)}</p></div>
}

/** Chart card with a Chart/Table switch so the data is available without relying on the plot. */
function ChartCard({ title, subtitle, data, unit, fmt = (v) => v, children }) {
  const [table, setTable] = useState(false)
  return (
    <section className="card p-5" aria-label={title}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h3 className="font-heading font-bold">{title}</h3><p className="text-xs text-muted">{subtitle}</p></div>
        <button onClick={() => setTable(!table)} className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:border-primary hover:text-primary" aria-pressed={table}>
          {table ? <><BarChart3 className="h-3.5 w-3.5" />Chart</> : <><Table2 className="h-3.5 w-3.5" />Table</>}
        </button>
      </div>
      {table ? (
        <div className="max-h-64 overflow-y-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted"><th className="py-1.5">{unit[0]}</th><th className="py-1.5 text-right">{unit[1]}</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.date} className="border-t border-line"><td className="py-1.5">{d.date}</td><td className="py-1.5 text-right font-semibold">{fmt(d.value)}</td></tr>)}</tbody></table></div>
      ) : <div className="h-64 text-[rgb(var(--chart-1))]">{children}</div>}
    </section>
  )
}

export default function Overview() {
  const { data, loading } = useAsync(load, [], demo)
  const { appSeries, revSeries, statusData, revenue } = useMemo(() => {
    if (!data) return {}
    const status = Object.fromEntries(APP_STATUSES.map(([k]) => [k, 0]))
    data.apps.forEach((a) => { status[a.status] = (status[a.status] ?? 0) + 1 })
    return {
      appSeries: series(data.apps, () => 1), revSeries: series(data.payments, (p) => Number(p.amount)),
      statusData: APP_STATUSES.map(([k, l]) => ({ date: l, value: status[k] })), revenue: data.payments.reduce((s, p) => s + Number(p.amount), 0),
    }
  }, [data])

  if (loading || !data) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-40" />)}</div>
  const c = data.counts
  const axis = { tickLine: false, axisLine: false, tickMargin: 8 }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Users} label="Candidates" value={c.candidates} />
        <StatCard icon={Send} label="Applications" value={c.applications} tone="cyan" />
        <StatCard icon={ClipboardList} label="Job requests" value={c.jobRequests} tone="accent" />
        <StatCard icon={Briefcase} label="Employer requests" value={c.employerRequests} />
        <StatCard icon={IndianRupee} label="Revenue (incl. GST)" value={money(revenue)} tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Applications" subtitle={`Per day, last ${DAYS} days`} data={appSeries} unit={['Date', 'Applications']}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={appSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs><linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".28" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" {...axis} interval={4} /><YAxis {...axis} allowDecimals={false} />
              <Tooltip content={<Tip fmt={(v) => `${v} application${v === 1 ? '' : 's'}`} />} cursor={{ stroke: 'rgb(var(--muted))', strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} fill="url(#gApp)" activeDot={{ r: 5, stroke: 'rgb(var(--surface))', strokeWidth: 2 }} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue" subtitle={`Paid orders per day, last ${DAYS} days`} data={revSeries} unit={['Date', 'Revenue']} fmt={money}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" {...axis} interval={4} /><YAxis {...axis} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip content={<Tip fmt={money} />} cursor={{ fill: 'rgb(var(--line) / .5)' }} />
              <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="xl:col-span-2">
          <ChartCard title="Application pipeline" subtitle="All applications by current status" data={statusData} unit={['Status', 'Applications']}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 32, left: 24, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" {...axis} allowDecimals={false} /><YAxis type="category" dataKey="date" {...axis} width={90} />
                <Tooltip content={<Tip fmt={(v) => `${v} application${v === 1 ? '' : 's'}`} />} cursor={{ fill: 'rgb(var(--line) / .5)' }} />
                <Bar dataKey="value" fill="currentColor" radius={[0, 4, 4, 0]} maxBarSize={16} label={{ position: 'right', fill: 'rgb(var(--fg))', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

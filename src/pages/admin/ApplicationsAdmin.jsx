import { useMemo, useState } from 'react'
import { Download, FileDown } from 'lucide-react'
import { DataTable, SearchBox, Select } from '../../components/dashboard/ui'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { useAsync, useAction, openCv, notifyStatus, downloadCsv, APP_STATUSES, fmtDate } from '../../lib/dash'
import { demoApplications } from '../../lib/demoData'

export default function ApplicationsAdmin() {
  const { toast } = useToast()
  const act = useAction()
  const { data, loading, setData } = useAsync(async () =>
    (await supabase.from('applications').select('*, jobs(title, company_name), candidates(full_name, email, phone, city, experience_years)').order('created_at', { ascending: false }).limit(3000)).data ?? [], [], demoApplications)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  const rows = useMemo(() => (data ?? []).filter((a) => (!status || a.status === status) &&
    (!q || `${a.candidates?.full_name} ${a.candidates?.email} ${a.jobs?.title} ${a.jobs?.company_name}`.toLowerCase().includes(q.toLowerCase()))), [data, q, status])

  const change = async (a, next) => {
    const prev = a.status
    setData((d) => d.map((x) => (x.id === a.id ? { ...x, status: next } : x)))
    const ok = await act(() => supabase.from('applications').update({ status: next }).eq('id', a.id), 'Status updated. Candidate notified.')
    if (ok) notifyStatus('application', a.id)
    else setData((d) => d.map((x) => (x.id === a.id ? { ...x, status: prev } : x)))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search candidate or job" />
        <Select label="Filter by status" value={status} onChange={setStatus} options={[['', 'All statuses'], ...APP_STATUSES]} className="!py-2.5" />
        <button className="btn btn-outline !py-2.5" onClick={() => downloadCsv('applications.csv', [
          { header: 'Candidate', value: (a) => a.candidates?.full_name }, { header: 'Email', value: (a) => a.candidates?.email }, { header: 'Phone', value: (a) => a.candidates?.phone },
          { header: 'Job', value: (a) => a.jobs?.title }, { header: 'Company', value: (a) => a.jobs?.company_name }, { header: 'Status', value: (a) => a.status }, { header: 'Applied', value: (a) => fmtDate(a.created_at) },
        ], rows)}><FileDown className="h-4 w-4" />Export CSV</button>
      </div>
      <DataTable loading={loading} rows={rows} empty="No applications found."
        columns={[
          { header: 'Candidate', render: (a) => <div><b>{a.candidates?.full_name}</b><br /><span className="text-xs text-muted">{a.candidates?.email}</span></div> },
          { header: 'Job', render: (a) => <div>{a.jobs?.title ?? <span className="text-muted">Removed</span>}<br /><span className="text-xs text-muted">{a.jobs?.company_name}</span></div> },
          { header: 'Applied', render: (a) => fmtDate(a.created_at) },
          { header: 'Status', render: (a) => <Select label={`Status for ${a.candidates?.full_name}`} value={a.status} onChange={(v) => change(a, v)} options={APP_STATUSES} /> },
          { header: 'CV', className: 'text-right', render: (a) => <button onClick={() => openCv(a.cv_url, toast)} aria-label="Download CV" className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-primary hover:text-primary"><Download className="h-4 w-4" /></button> },
        ]} />
    </div>
  )
}

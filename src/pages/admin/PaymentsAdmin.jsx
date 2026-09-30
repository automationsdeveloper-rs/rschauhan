import { useMemo, useState } from 'react'
import { FileDown } from 'lucide-react'
import { DataTable, SearchBox, Select, StatusBadge } from '../../components/dashboard/ui'
import { supabase } from '../../lib/supabase'
import { useAsync, downloadCsv, fmtDate, money } from '../../lib/dash'
import { demoPayments } from '../../lib/demoData'

async function load() {
  const [pays, cjr, er] = await Promise.all([
    supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(3000),
    supabase.from('candidate_job_requests').select('id, request_code, plan, candidates(full_name, email)'),
    supabase.from('employer_requests').select('id, request_code, plan, employers(company_name, email)'),
  ])
  const refs = {}
  ;(cjr.data ?? []).forEach((r) => { refs[r.id] = { code: r.request_code, plan: r.plan, who: r.candidates?.full_name, email: r.candidates?.email } })
  ;(er.data ?? []).forEach((r) => { refs[r.id] = { code: r.request_code, plan: r.plan, who: r.employers?.company_name, email: r.employers?.email } })
  return (pays.data ?? []).map((p) => ({ ...p, ...(refs[p.reference_id] ?? {}) }))
}

export default function PaymentsAdmin() {
  const { data, loading } = useAsync(load, [], demoPayments.map((p, i) => ({ ...p, who: ['Ananya Sharma', 'Rohit Verma', 'Acme Technologies'][i % 3], email: 'demo@example.com' })))
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const rows = useMemo(() => (data ?? []).filter((p) => (!status || p.status === status) && (!q || `${p.code} ${p.who} ${p.email} ${p.razorpay_payment_id}`.toLowerCase().includes(q.toLowerCase()))), [data, q, status])
  const total = rows.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search request, name or payment ID" />
        <Select label="Filter by status" value={status} onChange={setStatus} options={[['', 'All statuses'], ['paid', 'Paid'], ['created', 'Created'], ['failed', 'Failed'], ['refunded', 'Refunded']]} className="!py-2.5" />
        <button className="btn btn-outline !py-2.5" onClick={() => downloadCsv('payments.csv', [
          { header: 'Date', value: (p) => fmtDate(p.created_at) }, { header: 'Request', value: (p) => p.code }, { header: 'Type', value: (p) => p.type }, { header: 'Payer', value: (p) => p.who }, { header: 'Email', value: (p) => p.email },
          { header: 'Plan', value: (p) => p.plan }, { header: 'Amount (INR)', value: (p) => p.amount }, { header: 'Status', value: (p) => p.status }, { header: 'Order ID', value: (p) => p.razorpay_order_id }, { header: 'Payment ID', value: (p) => p.razorpay_payment_id },
        ], rows)}><FileDown className="h-4 w-4" />Export CSV</button>
      </div>
      <p className="text-sm text-muted">Collected in this view: <b className="text-fg">{money(total)}</b> (incl. GST)</p>
      <DataTable loading={loading} rows={rows} empty="No payments yet."
        columns={[
          { header: 'Date', render: (p) => fmtDate(p.created_at) },
          { header: 'Request', render: (p) => <div><b>{p.code ?? '—'}</b><br /><span className="text-xs capitalize text-muted">{p.type?.replace('_', ' ')} · {p.plan}</span></div> },
          { header: 'Payer', render: (p) => <div>{p.who ?? '—'}<br /><span className="text-xs text-muted">{p.email}</span></div> },
          { header: 'Amount', render: (p) => <b>{money(p.amount)}</b> },
          { header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
          { header: 'Razorpay ID', render: (p) => <span className="font-mono text-xs text-muted">{p.razorpay_payment_id ?? p.razorpay_order_id}</span> },
        ]} />
    </div>
  )
}

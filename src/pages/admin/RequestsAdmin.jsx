import { useMemo, useState } from 'react'
import { Download, FileDown, Settings2 } from 'lucide-react'
import { DataTable, Field, Modal, SearchBox, Select, StatusBadge } from '../../components/dashboard/ui'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { useAsync, useAction, openCv, notifyStatus, downloadCsv, CJR_STATUSES, PAY_STATUSES, fmtDate, label } from '../../lib/dash'
import { demoCandRequests } from '../../lib/demoData'

const payOptions = PAY_STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1)])

export default function RequestsAdmin() {
  const { toast } = useToast()
  const act = useAction()
  const { data, loading, setData } = useAsync(async () =>
    (await supabase.from('candidate_job_requests').select('*, candidates(full_name, email, phone, city, experience_years, skills)').order('created_at', { ascending: false }).limit(3000)).data ?? [], [], demoCandRequests)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [edit, setEdit] = useState(null)

  const rows = useMemo(() => (data ?? []).filter((r) => (!status || r.status === status) &&
    (!q || `${r.request_code} ${r.desired_role} ${r.candidates?.full_name} ${r.candidates?.email}`.toLowerCase().includes(q.toLowerCase()))), [data, q, status])

  const patch = async (r, changes, { notify = false, msg = 'Saved' } = {}) => {
    const ok = await act(() => supabase.from('candidate_job_requests').update(changes).eq('id', r.id), msg)
    if (ok) { setData((d) => d.map((x) => (x.id === r.id ? { ...x, ...changes } : x))); if (notify) notifyStatus('candidate_request', r.id) }
    return ok
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search code, role or candidate" />
        <Select label="Filter by status" value={status} onChange={setStatus} options={[['', 'All statuses'], ...CJR_STATUSES]} className="!py-2.5" />
        <button className="btn btn-outline !py-2.5" onClick={() => downloadCsv('job-requests.csv', [
          { header: 'Code', value: (r) => r.request_code }, { header: 'Candidate', value: (r) => r.candidates?.full_name }, { header: 'Email', value: (r) => r.candidates?.email }, { header: 'Role', value: (r) => r.desired_role },
          { header: 'Expected LPA', value: (r) => r.expected_salary }, { header: 'Locations', value: (r) => r.preferred_locations }, { header: 'Plan', value: (r) => r.plan }, { header: 'Payment', value: (r) => r.payment_status },
          { header: 'Status', value: (r) => r.status }, { header: 'Recruiter', value: (r) => r.assigned_recruiter }, { header: 'Created', value: (r) => fmtDate(r.created_at) },
        ], rows)}><FileDown className="h-4 w-4" />Export CSV</button>
      </div>
      <DataTable loading={loading} rows={rows} empty="No job requests yet."
        columns={[
          { header: 'Request', render: (r) => <div><b>{r.desired_role}</b><br /><span className="text-xs text-muted">{r.request_code} · {fmtDate(r.created_at)}</span></div> },
          { header: 'Candidate', render: (r) => <div>{r.candidates?.full_name}<br /><span className="text-xs text-muted">{r.candidates?.email}</span></div> },
          { header: 'Plan', render: (r) => <span className="capitalize">{r.plan}</span> },
          { header: 'Payment', render: (r) => <StatusBadge status={r.payment_status} /> },
          { header: 'Status', render: (r) => <Select label="Status" value={r.status} onChange={(v) => patch(r, { status: v }, { notify: true, msg: 'Status updated. Candidate notified.' })} options={CJR_STATUSES} /> },
          { header: 'Recruiter', render: (r) => r.assigned_recruiter ?? <span className="text-muted">Unassigned</span> },
          { header: '', className: 'text-right', render: (r) => <button onClick={() => setEdit({ ...r })} aria-label="Manage request" className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-primary hover:text-primary"><Settings2 className="h-4 w-4" /></button> },
        ]} />

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `${edit.desired_role} · ${edit.request_code}` : ''} wide>
        {edit && (
          <div className="space-y-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Candidate">{edit.candidates?.full_name}</Field><Field label="Contact">{edit.candidates?.email} · {edit.candidates?.phone}</Field>
              <Field label="Industry">{edit.industry}</Field><Field label="Expected salary">{edit.expected_salary && `₹${edit.expected_salary} LPA`}</Field>
              <Field label="Preferred locations">{(edit.preferred_locations ?? []).join(', ')}</Field><Field label="Job type / mode">{[edit.job_type, edit.work_mode].filter(Boolean).join(' · ')}</Field>
              <Field label="Willing to relocate">{edit.relocate == null ? '' : edit.relocate ? 'Yes' : 'No'}</Field><Field label="Company preferences">{edit.company_preferences}</Field>
            </dl>
            {edit.summary && <p className="rounded-xl bg-primary/5 p-3 text-sm">{edit.summary}</p>}
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium">Status<Select label="Status" value={edit.status} onChange={(v) => setEdit({ ...edit, status: v })} options={CJR_STATUSES} className="mt-1 !w-full !py-2.5" /></label>
              <label className="text-sm font-medium">Payment<Select label="Payment" value={edit.payment_status} onChange={(v) => setEdit({ ...edit, payment_status: v })} options={payOptions} className="mt-1 !w-full !py-2.5" /></label>
              <label className="text-sm font-medium">Assigned recruiter<input value={edit.assigned_recruiter ?? ''} onChange={(e) => setEdit({ ...edit, assigned_recruiter: e.target.value })} className="input mt-1 !py-2.5" placeholder="Name" /></label>
            </div>
            <label className="block text-sm font-medium">Internal notes<textarea rows={4} value={edit.admin_notes ?? ''} onChange={(e) => setEdit({ ...edit, admin_notes: e.target.value })} className="input mt-1" placeholder="Visible to admins only" /></label>
            <div className="flex flex-wrap gap-3">
              <button onClick={async () => { const orig = data.find((x) => x.id === edit.id); const changed = orig.status !== edit.status
                if (await patch(orig, { status: edit.status, payment_status: edit.payment_status, assigned_recruiter: edit.assigned_recruiter || null, admin_notes: edit.admin_notes || null }, { notify: changed, msg: 'Request updated' })) setEdit(null) }} className="btn btn-primary">Save changes</button>
              <button onClick={() => openCv(edit.cv_url, toast)} className="btn btn-outline"><Download className="h-4 w-4" />Download CV</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { FileDown, Send, Settings2, Trash2 } from 'lucide-react'
import { DataTable, Field, Modal, SearchBox, Select, StatusBadge } from '../../components/dashboard/ui'
import { supabase } from '../../lib/supabase'
import { useAsync, useAction, notifyStatus, downloadCsv, EMP_STATUSES, PAY_STATUSES, fmtDate } from '../../lib/dash'
import { demoEmployerRequests, demoCandidates, demoMatches } from '../../lib/demoData'

const payOptions = PAY_STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1)])
const score = (c, p) => { const mine = (c.skills ?? []).map((s) => s.toLowerCase()); const need = p.skills ?? []; return need.length ? need.filter((s) => mine.includes(s.toLowerCase())).length / need.length : 0 }

export default function EmployersAdmin() {
  const act = useAction()
  const { data, loading, setData, reload } = useAsync(async () =>
    (await supabase.from('employer_requests').select('*, employers(company_name, contact_person, email, phone, city), employer_positions(*)').order('created_at', { ascending: false }).limit(2000)).data ?? [], [], demoEmployerRequests)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [edit, setEdit] = useState(null)

  const rows = useMemo(() => (data ?? []).filter((r) => (!status || r.status === status) &&
    (!q || `${r.request_code} ${r.employers?.company_name} ${r.employers?.contact_person}`.toLowerCase().includes(q.toLowerCase()))), [data, q, status])

  const patch = async (r, changes, { notify = false, msg = 'Saved' } = {}) => {
    const ok = await act(() => supabase.from('employer_requests').update(changes).eq('id', r.id), msg)
    if (ok) { setData((d) => d.map((x) => (x.id === r.id ? { ...x, ...changes } : x))); if (notify) notifyStatus('employer_request', r.id) }
    return ok
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search code, company or contact" />
        <Select label="Filter by status" value={status} onChange={setStatus} options={[['', 'All statuses'], ...EMP_STATUSES]} className="!py-2.5" />
        <button className="btn btn-outline !py-2.5" onClick={() => downloadCsv('employer-requests.csv', [
          { header: 'Code', value: (r) => r.request_code }, { header: 'Company', value: (r) => r.employers?.company_name }, { header: 'Contact', value: (r) => r.employers?.contact_person },
          { header: 'Email', value: (r) => r.employers?.email }, { header: 'Positions', value: (r) => (r.employer_positions ?? []).map((p) => `${p.job_title} x${p.openings}`) },
          { header: 'Plan', value: (r) => r.plan }, { header: 'Payment', value: (r) => r.payment_status }, { header: 'Status', value: (r) => r.status }, { header: 'Recruiter', value: (r) => r.assigned_recruiter }, { header: 'Created', value: (r) => fmtDate(r.created_at) },
        ], rows)}><FileDown className="h-4 w-4" />Export CSV</button>
      </div>
      <DataTable loading={loading} rows={rows} empty="No employer requests yet."
        columns={[
          { header: 'Company', render: (r) => <div><b>{r.employers?.company_name}</b><br /><span className="text-xs text-muted">{r.request_code} · {fmtDate(r.created_at)}</span></div> },
          { header: 'Contact', render: (r) => <div>{r.employers?.contact_person}<br /><span className="text-xs text-muted">{r.employers?.email}</span></div> },
          { header: 'Positions', render: (r) => (r.employer_positions ?? []).length },
          { header: 'Plan', render: (r) => <span className="capitalize">{r.plan}</span> },
          { header: 'Payment', render: (r) => <StatusBadge status={r.payment_status} /> },
          { header: 'Status', render: (r) => <Select label="Status" value={r.status} onChange={(v) => patch(r, { status: v }, { notify: true, msg: 'Status updated. Employer notified.' })} options={EMP_STATUSES} /> },
          { header: '', className: 'text-right', render: (r) => <button onClick={() => setEdit(r.id)} aria-label="Manage request" className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-primary hover:text-primary"><Settings2 className="h-4 w-4" /></button> },
        ]} />
      {edit && <Manage key={edit} request={data.find((r) => r.id === edit)} patch={patch} onClose={() => { setEdit(null); reload() }} />}
    </div>
  )
}

function Manage({ request, patch, onClose }) {
  const act = useAction()
  const [f, setF] = useState({ assigned_recruiter: request.assigned_recruiter ?? '', admin_notes: request.admin_notes ?? '', payment_status: request.payment_status })
  const [pos, setPos] = useState(request.employer_positions?.[0]?.id)
  const [cq, setCq] = useState('')
  const position = request.employer_positions?.find((p) => p.id === pos)

  const { data: cands } = useAsync(async () => (await supabase.from('candidates').select('id, full_name, city, experience_years, skills, expected_ctc').limit(3000)).data ?? [], [], demoCandidates)
  const { data: matches, reload } = useAsync(async () => (await supabase.from('matches').select('id, status, candidate_id, position_id').in('position_id', (request.employer_positions ?? []).map((p) => p.id))).data ?? [], [request.id],
    demoMatches.map((m) => ({ id: m.match_id, status: m.status, candidate_id: demoCandidates[0].id, position_id: m.position_id })))
  const shared = (matches ?? []).filter((m) => m.position_id === pos)

  const suggestions = useMemo(() => (cands ?? []).filter((c) => !shared.some((m) => m.candidate_id === c.id) && (!cq || `${c.full_name} ${(c.skills ?? []).join(' ')} ${c.city}`.toLowerCase().includes(cq.toLowerCase())))
    .map((c) => ({ c, s: position ? score(c, position) : 0 })).sort((a, b) => b.s - a.s).slice(0, 6), [cands, shared, cq, position])

  const share = async (c) => {
    if (await act(() => supabase.from('matches').insert({ position_id: pos, candidate_id: c.id }), `Profile of ${c.full_name} shared with employer`)) {
      reload()
      if (request.status !== 'profiles_shared') patch(request, { status: 'profiles_shared' }, { notify: true, msg: 'Status set to Profiles Shared. Employer notified.' })
      else notifyStatus('employer_request', request.id)
    }
  }
  const unshare = async (m) => { if (await act(() => supabase.from('matches').delete().eq('id', m.id), 'Profile removed')) reload() }

  return (
    <Modal open onClose={onClose} title={`${request.employers?.company_name} · ${request.request_code}`} wide>
      <div className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact">{request.employers?.contact_person} · {request.employers?.email}</Field><Field label="Phone / City">{request.employers?.phone} · {request.employers?.city}</Field>
        </dl>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">Payment<Select label="Payment" value={f.payment_status} onChange={(v) => setF({ ...f, payment_status: v })} options={payOptions} className="mt-1 !w-full !py-2.5" /></label>
          <label className="text-sm font-medium sm:col-span-2">Assigned recruiter<input value={f.assigned_recruiter} onChange={(e) => setF({ ...f, assigned_recruiter: e.target.value })} className="input mt-1 !py-2.5" /></label>
        </div>
        <label className="block text-sm font-medium">Internal notes<textarea rows={3} value={f.admin_notes} onChange={(e) => setF({ ...f, admin_notes: e.target.value })} className="input mt-1" /></label>
        <button onClick={() => patch(request, { payment_status: f.payment_status, assigned_recruiter: f.assigned_recruiter || null, admin_notes: f.admin_notes || null }, { msg: 'Request updated' })} className="btn btn-outline">Save details</button>

        <section className="border-t border-line pt-5">
          <h3 className="mb-3 font-heading font-bold">Match candidates to positions</h3>
          <div className="mb-4 flex flex-wrap gap-2" role="tablist">
            {(request.employer_positions ?? []).map((p) => (
              <button key={p.id} role="tab" aria-selected={p.id === pos} onClick={() => setPos(p.id)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${p.id === pos ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted'}`}>{p.job_title} ×{p.openings}</button>
            ))}
          </div>
          {position && <p className="mb-3 text-xs text-muted">{position.location} · {position.exp_min}–{position.exp_max} yrs · ₹{position.budget_min}–{position.budget_max} LPA · needs: {(position.skills ?? []).join(', ')}</p>}

          {shared.length > 0 && <ul className="mb-4 space-y-2">{shared.map((m) => { const c = (cands ?? []).find((x) => x.id === m.candidate_id); return (
            <li key={m.id} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-sm"><span><b>{c?.full_name ?? 'Candidate'}</b> <StatusBadge status={m.status} /></span>
              <button onClick={() => unshare(m)} aria-label="Remove shared profile" className="text-danger hover:opacity-70"><Trash2 className="h-4 w-4" /></button></li>) })}</ul>}

          <SearchBox value={cq} onChange={setCq} placeholder="Search candidates by name, skill or city" />
          <ul className="mt-3 space-y-2">
            {suggestions.map(({ c, s }) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm">
                <div className="min-w-0 flex-1"><b>{c.full_name}</b> <span className="text-muted">· {c.city} · {c.experience_years ?? '?'} yrs</span><br /><span className="truncate text-xs text-muted">{(c.skills ?? []).join(', ')}</span></div>
                {s > 0 && <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">{Math.round(s * 100)}% skills</span>}
                <button onClick={() => share(c)} className="btn btn-primary !px-3 !py-1.5 !text-xs"><Send className="h-3.5 w-3.5" />Share</button>
              </li>
            ))}
            {suggestions.length === 0 && <li className="py-4 text-center text-sm text-muted">No candidates found.</li>}
          </ul>
        </section>
      </div>
    </Modal>
  )
}

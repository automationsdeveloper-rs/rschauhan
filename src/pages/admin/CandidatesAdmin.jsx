import { useMemo, useState } from 'react'
import { Download, Eye, FileDown } from 'lucide-react'
import { DataTable, Field, Modal, SearchBox } from '../../components/dashboard/ui'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { useAsync, openCv, downloadCsv, fmtDate } from '../../lib/dash'
import { demoCandidates } from '../../lib/demoData'

export const candidateColumns = [
  { header: 'Name', value: (c) => c.full_name }, { header: 'Email', value: (c) => c.email }, { header: 'Phone', value: (c) => c.phone }, { header: 'City', value: (c) => c.city },
  { header: 'Experience (yrs)', value: (c) => c.experience_years }, { header: 'Current company', value: (c) => c.current_company }, { header: 'Designation', value: (c) => c.designation },
  { header: 'Current CTC (LPA)', value: (c) => c.current_ctc }, { header: 'Expected CTC (LPA)', value: (c) => c.expected_ctc }, { header: 'Notice period', value: (c) => c.notice_period },
  { header: 'Skills', value: (c) => c.skills }, { header: 'Qualification', value: (c) => c.qualification }, { header: 'LinkedIn', value: (c) => c.linkedin_url }, { header: 'Joined', value: (c) => fmtDate(c.created_at) },
]

export default function CandidatesAdmin() {
  const { toast } = useToast()
  const { data, loading } = useAsync(async () => (await supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(3000)).data ?? [], [], demoCandidates)
  const [f, setF] = useState({ q: '', skill: '', minExp: '', city: '' })
  const [open, setOpen] = useState(null)

  const rows = useMemo(() => (data ?? []).filter((c) => {
    const q = f.q.toLowerCase()
    if (q && !`${c.full_name} ${c.email} ${c.phone}`.toLowerCase().includes(q)) return false
    if (f.skill && !(c.skills ?? []).some((s) => s.toLowerCase().includes(f.skill.toLowerCase()))) return false
    if (f.minExp && (c.experience_years ?? 0) < Number(f.minExp)) return false
    if (f.city && !(c.city ?? '').toLowerCase().includes(f.city.toLowerCase())) return false
    return true
  }), [data, f])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={f.q} onChange={(q) => setF({ ...f, q })} placeholder="Search name, email, phone" />
        <input value={f.skill} onChange={(e) => setF({ ...f, skill: e.target.value })} placeholder="Skill" aria-label="Filter by skill" className="input !w-32 !py-2.5" />
        <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="City" aria-label="Filter by city" className="input !w-32 !py-2.5" />
        <input value={f.minExp} onChange={(e) => setF({ ...f, minExp: e.target.value })} type="number" min="0" placeholder="Min yrs" aria-label="Minimum experience" className="input !w-28 !py-2.5" />
        <button onClick={() => downloadCsv('candidates.csv', candidateColumns, rows)} className="btn btn-outline !py-2.5"><FileDown className="h-4 w-4" />Export CSV</button>
      </div>
      <p className="text-sm text-muted">{rows.length} candidate{rows.length === 1 ? '' : 's'}</p>

      <DataTable loading={loading} rows={rows} empty="No candidates match these filters."
        columns={[
          { header: 'Candidate', render: (c) => <div><b>{c.full_name}</b><br /><span className="text-xs text-muted">{c.email}</span></div> },
          { header: 'City', render: (c) => c.city ?? '—' },
          { header: 'Exp', render: (c) => (c.experience_years != null ? `${c.experience_years} yrs` : '—') },
          { header: 'Skills', render: (c) => <div className="flex max-w-[220px] flex-wrap gap-1">{(c.skills ?? []).slice(0, 3).map((s) => <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{s}</span>)}</div> },
          { header: 'Expected', render: (c) => (c.expected_ctc ? `₹${c.expected_ctc} LPA` : '—') },
          { header: 'Joined', render: (c) => fmtDate(c.created_at) },
          { header: 'Actions', className: 'text-right', render: (c) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => setOpen(c)} aria-label={`View ${c.full_name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-primary hover:text-primary"><Eye className="h-4 w-4" /></button>
              <button onClick={() => openCv(c.cv_url, toast)} aria-label={`Download CV of ${c.full_name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-primary hover:text-primary"><Download className="h-4 w-4" /></button>
            </div>) },
        ]} />

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.full_name ?? ''} wide>
        {open && (
          <>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">{open.email}</Field><Field label="Phone">{open.phone}</Field><Field label="City">{open.city}</Field>
              <Field label="Experience">{open.experience_years != null && `${open.experience_years} yrs`}</Field>
              <Field label="Current role">{[open.designation, open.current_company].filter(Boolean).join(' @ ')}</Field><Field label="Qualification">{open.qualification}</Field>
              <Field label="Current CTC">{open.current_ctc && `₹${open.current_ctc} LPA`}</Field><Field label="Expected CTC">{open.expected_ctc && `₹${open.expected_ctc} LPA`}</Field>
              <Field label="Notice period">{open.notice_period}</Field>
              <Field label="LinkedIn">{open.linkedin_url && <a href={open.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{open.linkedin_url}</a>}</Field>
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">{(open.skills ?? []).map((s) => <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{s}</span>)}</div>
            <button onClick={() => openCv(open.cv_url, toast)} className="btn btn-primary mt-6"><Download className="h-4 w-4" />Download CV</button>
          </>
        )}
      </Modal>
    </div>
  )
}

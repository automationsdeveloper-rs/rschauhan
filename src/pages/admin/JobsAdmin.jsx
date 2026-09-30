import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable, Modal, SearchBox, StatusBadge } from '../../components/dashboard/ui'
import { Input, Select, Textarea, TagInput } from '../../components/forms/Fields'
import { supabase } from '../../lib/supabase'
import { clearJobsCache } from '../../lib/jobsApi'
import { useAsync, useAction, fmtDate } from '../../lib/dash'
import { demoJobs } from '../../lib/demoData'
import { industries } from '../../config/site'
import { JOB_TYPES, WORK_MODES } from '../../../shared/schemas'

const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const blank = { title: '', company_name: '', location: '', job_type: 'Full-time', work_mode: 'Onsite', salary_min: '', salary_max: '', exp_min: '0', exp_max: '', industry: '', skills: [], description: '', responsibilities: '', requirements: '', benefits: '', status: 'open' }
const toForm = (j) => ({ ...blank, ...j, salary_min: String(j.salary_min ?? ''), salary_max: String(j.salary_max ?? ''), exp_min: String(j.exp_min ?? 0), exp_max: String(j.exp_max ?? ''),
  responsibilities: (j.responsibilities ?? []).join('\n'), requirements: (j.requirements ?? []).join('\n'), benefits: (j.benefits ?? []).join('\n'), skills: j.skills ?? [], industry: j.industry ?? '' })

export default function JobsAdmin() {
  const act = useAction()
  const { data, loading, reload, setData } = useAsync(async () => (await supabase.from('jobs').select('*').order('created_at', { ascending: false })).data ?? [], [], demoJobs)
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null) // null = closed
  const [errors, setErrors] = useState({})

  const rows = useMemo(() => (data ?? []).filter((j) => !q || `${j.title} ${j.company_name}`.toLowerCase().includes(q.toLowerCase())), [data, q])
  const refresh = () => { clearJobsCache(); reload() }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    const er = {}
    if (form.title.trim().length < 3) er.title = 'Title is required'
    if (!form.company_name.trim()) er.company_name = 'Company is required'
    if (!form.location.trim()) er.location = 'Location is required'
    const n = (k) => form[k] !== '' && !isNaN(form[k]) && Number(form[k]) >= 0
    if (!n('salary_min')) er.salary_min = 'Required'
    if (!n('salary_max') || Number(form.salary_max) < Number(form.salary_min)) er.salary_max = 'Must be ≥ min'
    if (!n('exp_min')) er.exp_min = 'Required'
    if (!n('exp_max') || Number(form.exp_max) < Number(form.exp_min)) er.exp_max = 'Must be ≥ min'
    setErrors(er)
    if (Object.keys(er).length) return
    const row = {
      title: form.title.trim(), company_name: form.company_name.trim(), location: form.location.trim(), job_type: form.job_type, work_mode: form.work_mode,
      salary_min: +form.salary_min, salary_max: +form.salary_max, exp_min: +form.exp_min, exp_max: +form.exp_max, industry: form.industry || null, skills: form.skills,
      description: form.description, responsibilities: lines(form.responsibilities), requirements: lines(form.requirements), benefits: lines(form.benefits), status: form.status,
    }
    const ok = await act(() => (form.id ? supabase.from('jobs').update(row).eq('id', form.id) : supabase.from('jobs').insert(row)), form.id ? 'Job updated' : 'Job created')
    if (ok) { setForm(null); refresh() }
  }

  const toggle = async (j) => {
    const status = j.status === 'open' ? 'closed' : 'open'
    if (await act(() => supabase.from('jobs').update({ status }).eq('id', j.id), status === 'open' ? 'Job published' : 'Job unpublished')) { setData((d) => d.map((x) => (x.id === j.id ? { ...x, status } : x))); clearJobsCache() }
  }
  const remove = async (j) => {
    if (!window.confirm(`Delete "${j.title}"? Applications to this job will be deleted too.`)) return
    if (await act(() => supabase.from('jobs').delete().eq('id', j.id), 'Job deleted')) refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search jobs" />
        <button onClick={() => { setErrors({}); setForm({ ...blank }) }} className="btn btn-primary !py-2.5"><Plus className="h-4 w-4" />New job</button>
      </div>
      <DataTable loading={loading} rows={rows} empty="No jobs yet."
        columns={[
          { header: 'Job', render: (j) => <div><b>{j.title}</b><br /><span className="text-xs text-muted">{j.company_name} · {j.location}</span></div> },
          { header: 'Type', render: (j) => `${j.job_type} · ${j.work_mode}` },
          { header: 'Salary', render: (j) => `₹${j.salary_min}–${j.salary_max} LPA` },
          { header: 'Posted', render: (j) => fmtDate(j.created_at) },
          { header: 'Status', render: (j) => (
            <button onClick={() => toggle(j)} title={j.status === 'open' ? 'Click to unpublish' : 'Click to publish'} aria-label={`${j.status === 'open' ? 'Unpublish' : 'Publish'} ${j.title}`}><StatusBadge status={j.status} text={j.status === 'open' ? 'Published' : 'Draft / closed'} /></button>) },
          { header: '', className: 'text-right', render: (j) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => { setErrors({}); setForm(toForm(j)) }} aria-label={`Edit ${j.title}`} className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-primary hover:text-primary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(j)} aria-label={`Delete ${j.title}`} className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-danger hover:text-danger"><Trash2 className="h-4 w-4" /></button>
            </div>) },
        ]} />

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit job' : 'New job'} wide>
        {form && (
          <form onSubmit={save} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Job title *" value={form.title} onChange={set('title')} error={errors.title} />
              <Input label="Company *" value={form.company_name} onChange={set('company_name')} error={errors.company_name} />
              <Input label="Location *" value={form.location} onChange={set('location')} error={errors.location} />
              <Select label="Industry" options={industries.map((i) => i.name)} value={form.industry} onChange={set('industry')} />
              <Select label="Job type" options={JOB_TYPES} value={form.job_type} onChange={set('job_type')} />
              <Select label="Work mode" options={WORK_MODES} value={form.work_mode} onChange={set('work_mode')} />
              <Input label="Min salary (LPA) *" type="number" step="0.1" min="0" value={form.salary_min} onChange={set('salary_min')} error={errors.salary_min} />
              <Input label="Max salary (LPA) *" type="number" step="0.1" min="0" value={form.salary_max} onChange={set('salary_max')} error={errors.salary_max} />
              <Input label="Min experience (yrs) *" type="number" step="0.5" min="0" value={form.exp_min} onChange={set('exp_min')} error={errors.exp_min} />
              <Input label="Max experience (yrs) *" type="number" step="0.5" min="0" value={form.exp_max} onChange={set('exp_max')} error={errors.exp_max} />
            </div>
            <div><p className="mb-2 text-sm font-medium">Skills</p><TagInput label="Skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} /></div>
            <Textarea label="Description" rows={4} value={form.description} onChange={set('description')} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Textarea label="Responsibilities (one per line)" rows={5} value={form.responsibilities} onChange={set('responsibilities')} />
              <Textarea label="Requirements (one per line)" rows={5} value={form.requirements} onChange={set('requirements')} />
              <Textarea label="Benefits (one per line)" rows={5} value={form.benefits} onChange={set('benefits')} />
            </div>
            <label className="flex items-center gap-2.5 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-[#5B4BFF]" checked={form.status === 'open'} onChange={(e) => setForm({ ...form, status: e.target.checked ? 'open' : 'closed' })} />Published (visible on the website)</label>
            <button className="btn btn-primary">{form.id ? 'Save changes' : 'Create job'}</button>
          </form>
        )}
      </Modal>
    </div>
  )
}

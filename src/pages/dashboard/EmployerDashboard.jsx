import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, CheckCircle2, Download, FileText, Plus, Receipt, Users, XCircle } from 'lucide-react'
import { DashShell, StatCard, StatusBadge, Tracker, EmptyBlock, DataTable } from '../../components/dashboard/ui'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { useAsync, useAction, openCv, EMP_STATUSES, label, fmtDate, money } from '../../lib/dash'
import { demoEmployerRequests, demoMatches, demoPayments } from '../../lib/demoData'
import { getPlan } from '../../../shared/plans'
import { site } from '../../config/site'
import { useSeo } from '../../lib/hooks'

async function loadAll() {
  const [reqs, matches, pays, emp] = await Promise.all([
    supabase.from('employer_requests').select('*, employer_positions(*)').order('created_at', { ascending: false }),
    supabase.rpc('employer_matches'),
    supabase.from('payments').select('*').order('created_at', { ascending: false }),
    supabase.from('employers').select('*').limit(1).maybeSingle(),
  ])
  return { requests: reqs.data ?? [], matches: matches.data ?? [], payments: pays.data ?? [], employer: emp.data }
}
const demo = { requests: demoEmployerRequests, matches: demoMatches, payments: demoPayments, employer: demoEmployerRequests[0].employers }

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/** Opens a print-ready GST invoice in a new window (user can "Save as PDF"). */
function printInvoice(pay, request, employer) {
  const total = Number(pay.amount)
  const sub = Math.round(total / 1.18)
  const plan = getPlan('employer', request?.plan)
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.write(`<!doctype html><title>Invoice ${esc(pay.razorpay_payment_id || pay.id.slice(0, 8))}</title>
  <style>body{font:14px Inter,Arial,sans-serif;color:#0f172a;max-width:720px;margin:40px auto;padding:0 20px}h1{color:#5B4BFF;margin:0}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left}td:last-child,th:last-child{text-align:right}.muted{color:#64748b}.tot td{font-weight:700;font-size:16px;border:0}</style>
  <div style="display:flex;justify-content:space-between"><div><h1>${esc(site.name)}</h1><p class="muted">${esc(site.address)}<br>${esc(site.email)}</p></div>
  <div style="text-align:right"><h2 style="margin:0">TAX INVOICE</h2><p class="muted">No: ${esc((pay.razorpay_payment_id || pay.id).slice(-10).toUpperCase())}<br>Date: ${esc(fmtDate(pay.created_at))}</p></div></div>
  <p><b>Billed to</b><br>${esc(employer?.company_name)}<br>${esc(employer?.contact_person)} · ${esc(employer?.email)}</p>
  <table><tr><th>Description</th><th>Amount</th></tr>
  <tr><td>${esc(plan?.name ?? request?.plan)} — Hiring request ${esc(request?.request_code)}</td><td>${esc(money(sub))}</td></tr>
  <tr><td class="muted">GST @ 18%</td><td>${esc(money(total - sub))}</td></tr>
  <tr class="tot"><td>Total paid (INR)</td><td>${esc(money(total))}</td></tr></table>
  <p class="muted" style="margin-top:32px">Payment ID: ${esc(pay.razorpay_payment_id)} · Order: ${esc(pay.razorpay_order_id)}<br>This is a computer-generated invoice.</p>
  <script>window.onload=()=>window.print()</script>`)
  w.document.close()
  return true
}

export default function EmployerDashboard() {
  useSeo({ title: 'Employer Dashboard — HireNest' })
  const { user } = useAuth()
  const { toast } = useToast()
  const act = useAction()
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') || 'requests'
  const [reqFilter, setReqFilter] = useState('')
  const { data, loading, setData } = useAsync(() => loadAll(), [user?.id], demo)

  if (loading || !data) return <div className="container pt-32"><div className="skeleton h-96" /></div>
  const { requests, matches, payments, employer } = data
  const shortlisted = matches.filter((m) => m.status === 'shortlisted').length

  const setStatus = async (m, status) => {
    if (await act(() => supabase.rpc('set_match_status', { p_match: m.match_id, p_status: status }), status === 'shortlisted' ? 'Candidate shortlisted' : 'Candidate rejected'))
      setData((d) => ({ ...d, matches: d.matches.map((x) => (x.match_id === m.match_id ? { ...x, status } : x)) }))
  }

  const tabs = [{ id: 'requests', label: 'Hiring Requests', icon: Building2 }, { id: 'profiles', label: 'Candidate Profiles', icon: Users, badge: matches.filter((m) => m.status === 'shared').length }, { id: 'payments', label: 'Payments & Invoices', icon: Receipt }]

  return (
    <DashShell title={employer?.company_name ?? 'Employer dashboard'} subtitle="Manage hiring requests, review profiles and download invoices." tabs={tabs} active={tab} onChange={(t) => setSp({ tab: t })}
      aside={<Button to="/hire#hire-form" arrow><Plus className="h-4 w-4" />Raise new request</Button>}>
      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Building2} label="Requests" value={requests.length} />
            <StatCard icon={Users} label="Profiles shared" value={matches.length} tone="cyan" />
            <StatCard icon={CheckCircle2} label="Shortlisted" value={shortlisted} tone="success" />
          </div>
          {requests.length === 0 ? <EmptyBlock icon={Building2} title="No hiring requests yet" text="Tell us who you need and get verified profiles within 48 hours." action={<Button to="/hire#hire-form" arrow>Raise a request</Button>} /> :
            requests.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-bold">{r.request_code}</h3><p className="text-sm text-muted">{getPlan('employer', r.plan)?.name ?? r.plan} · {fmtDate(r.created_at)}</p></div>
                  <div className="flex gap-2"><StatusBadge status={r.status} text={label(EMP_STATUSES, r.status)} /><StatusBadge status={r.payment_status} text={`Payment: ${r.payment_status}`} /></div>
                </div>
                <div className="mt-5"><Tracker steps={EMP_STATUSES} current={r.status} /></div>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {(r.employer_positions ?? []).map((p) => (
                    <li key={p.id} className="rounded-xl border border-line p-3 text-sm"><b>{p.job_title}</b> <span className="text-muted">× {p.openings}</span><br />
                      <span className="text-xs text-muted">{p.location} · {p.work_mode} · {p.exp_min}–{p.exp_max} yrs · ₹{p.budget_min}–{p.budget_max} LPA</span></li>
                  ))}
                </ul>
                {r.payment_status === 'pending' && <p className="mt-4 rounded-xl bg-accent/10 p-3 text-xs text-accent-600">Payment pending: our team starts sourcing once payment is confirmed (Enterprise requests are activated after your quote is accepted).</p>}
                {r.assigned_recruiter && <p className="mt-4 text-sm text-muted">Your recruiter: <b className="text-fg">{r.assigned_recruiter}</b></p>}
              </div>
            ))}
        </div>
      )}

      {tab === 'profiles' && (() => {
        const shown = requests.filter((r) => !reqFilter || r.id === reqFilter)
        if (!matches.length) return <EmptyBlock icon={Users} title="No profiles shared yet" text="Verified profiles usually arrive within 48 hours of payment confirmation." />
        return (
          <div className="space-y-6">
            <label className="flex items-center gap-3 text-sm text-muted">Request
              <select value={reqFilter} onChange={(e) => setReqFilter(e.target.value)} className="input !w-auto !py-2"><option value="">All requests</option>{requests.map((r) => <option key={r.id} value={r.id}>{r.request_code}</option>)}</select></label>
            {shown.flatMap((r) => (r.employer_positions ?? []).map((p) => ({ r, p, list: matches.filter((m) => m.position_id === p.id) }))).filter((x) => x.list.length).map(({ r, p, list }) => (
              <section key={p.id}>
                <h3 className="mb-3 font-heading font-bold">{p.job_title} <span className="text-sm font-normal text-muted">· {r.request_code}</span></h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {list.map((m) => (
                    <article key={m.match_id} className={`card p-5 ${m.status === 'rejected' ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div><h4 className="font-bold">{m.full_name}</h4><p className="text-sm text-muted">{m.designation}{m.current_company && ` @ ${m.current_company}`}</p></div>
                        <StatusBadge status={m.status} />
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                        <div>📍 {m.city}</div><div>💼 {m.experience_years} yrs</div><div>💰 ₹{m.expected_ctc} LPA expected</div><div>⏱ {m.notice_period}</div>
                      </dl>
                      <div className="mt-3 flex flex-wrap gap-1.5">{(m.skills ?? []).map((s) => <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{s}</span>)}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => openCv(m.cv_url, toast)} className="btn btn-outline !px-3.5 !py-2"><Download className="h-4 w-4" />CV</button>
                        <button onClick={() => setStatus(m, 'shortlisted')} disabled={m.status === 'shortlisted'} className="btn btn-primary !px-3.5 !py-2"><CheckCircle2 className="h-4 w-4" />Shortlist</button>
                        <button onClick={() => setStatus(m, 'rejected')} disabled={m.status === 'rejected'} className="btn btn-ghost !px-3.5 !py-2 !text-danger hover:!bg-danger/10"><XCircle className="h-4 w-4" />Reject</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      })()}

      {tab === 'payments' && (
        <DataTable rows={payments} empty="No payments yet."
          columns={[
            { header: 'Date', render: (p) => fmtDate(p.created_at) },
            { header: 'Request', render: (p) => requests.find((r) => r.id === p.reference_id)?.request_code ?? '—' },
            { header: 'Amount (incl. GST)', render: (p) => <b>{money(p.amount)}</b> },
            { header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
            { header: 'Invoice', className: 'text-right', render: (p) => p.status === 'paid'
              ? <button onClick={() => { if (!printInvoice(p, requests.find((r) => r.id === p.reference_id), employer)) toast('Allow pop-ups to open the invoice.', 'info') }} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><FileText className="h-4 w-4" />Invoice</button>
              : <span className="text-muted">—</span> },
          ]} />
      )}
    </DashShell>
  )
}

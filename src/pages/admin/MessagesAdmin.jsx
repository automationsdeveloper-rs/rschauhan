import { useMemo, useState } from 'react'
import { FileDown, Inbox, Users } from 'lucide-react'
import { DataTable, SearchBox } from '../../components/dashboard/ui'
import { supabase } from '../../lib/supabase'
import { useAsync, downloadCsv, fmtDate } from '../../lib/dash'
import { demoMessages, demoSubscribers } from '../../lib/demoData'

async function load() {
  const [m, s] = await Promise.all([
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(2000),
    supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(5000),
  ])
  return { messages: m.data ?? [], subscribers: s.data ?? [] }
}

export default function MessagesAdmin() {
  const { data, loading } = useAsync(load, [], { messages: demoMessages, subscribers: demoSubscribers })
  const [view, setView] = useState('messages')
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const list = data?.[view] ?? []
    const needle = q.toLowerCase()
    return needle ? list.filter((r) => `${r.name ?? ''} ${r.email} ${r.subject ?? ''} ${r.role_interest ?? ''} ${r.location_interest ?? ''}`.toLowerCase().includes(needle)) : list
  }, [data, view, q])

  const exportCsv = () => (view === 'messages'
    ? downloadCsv('contact-messages.csv', [{ header: 'Date', value: (r) => fmtDate(r.created_at) }, { header: 'Name', value: (r) => r.name }, { header: 'Email', value: (r) => r.email }, { header: 'Phone', value: (r) => r.phone }, { header: 'Subject', value: (r) => r.subject }, { header: 'Message', value: (r) => r.message }], rows)
    : downloadCsv('subscribers.csv', [{ header: 'Date', value: (r) => fmtDate(r.created_at) }, { header: 'Email', value: (r) => r.email }, { header: 'Role interest', value: (r) => r.role_interest }, { header: 'Location interest', value: (r) => r.location_interest }], rows))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex rounded-xl border border-line p-1">
          {[['messages', 'Messages', Inbox], ['subscribers', 'Job-alert subscribers', Users]].map(([id, label, Icon]) => (
            <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)} className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${view === id ? 'bg-primary text-white' : 'text-muted hover:text-fg'}`}><Icon className="h-4 w-4" aria-hidden />{label}</button>
          ))}
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search" />
        <button onClick={exportCsv} className="btn btn-outline !py-2.5"><FileDown className="h-4 w-4" aria-hidden />Export CSV</button>
      </div>
      {view === 'messages' ? (
        <DataTable loading={loading} rows={rows} empty="No messages yet."
          columns={[
            { header: 'Date', render: (r) => fmtDate(r.created_at) },
            { header: 'From', render: (r) => <div><b>{r.name}</b><br /><a href={`mailto:${r.email}`} className="text-xs text-primary hover:underline">{r.email}</a>{r.phone && <span className="block text-xs text-muted">{r.phone}</span>}</div> },
            { header: 'Subject', render: (r) => r.subject ?? '—' },
            { header: 'Message', render: (r) => <p className="max-w-md whitespace-pre-wrap text-sm text-muted">{r.message}</p> },
          ]} />
      ) : (
        <DataTable loading={loading} rows={rows} empty="No subscribers yet."
          columns={[
            { header: 'Date', render: (r) => fmtDate(r.created_at) },
            { header: 'Email', render: (r) => r.email },
            { header: 'Role interest', render: (r) => r.role_interest ?? <span className="text-muted">Any</span> },
            { header: 'Location', render: (r) => r.location_interest ?? <span className="text-muted">Any</span> },
          ]} />
      )}
    </div>
  )
}

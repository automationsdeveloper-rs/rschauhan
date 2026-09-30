import { useSearchParams } from 'react-router-dom'
import { Briefcase, Building2, ClipboardList, CreditCard, Inbox, LayoutDashboard, Send, Users } from 'lucide-react'
import { DashShell } from '../../components/dashboard/ui'
import Overview from './Overview'
import CandidatesAdmin from './CandidatesAdmin'
import ApplicationsAdmin from './ApplicationsAdmin'
import RequestsAdmin from './RequestsAdmin'
import EmployersAdmin from './EmployersAdmin'
import JobsAdmin from './JobsAdmin'
import PaymentsAdmin from './PaymentsAdmin'
import MessagesAdmin from './MessagesAdmin'
import { useSeo } from '../../lib/hooks'
import { isDemo } from '../../lib/supabase'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, view: Overview },
  { id: 'candidates', label: 'Candidates', icon: Users, view: CandidatesAdmin },
  { id: 'applications', label: 'Applications', icon: Send, view: ApplicationsAdmin },
  { id: 'requests', label: 'Job Requests', icon: ClipboardList, view: RequestsAdmin },
  { id: 'employers', label: 'Employer Requests', icon: Building2, view: EmployersAdmin },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, view: JobsAdmin },
  { id: 'payments', label: 'Payments', icon: CreditCard, view: PaymentsAdmin },
  { id: 'messages', label: 'Messages & Alerts', icon: Inbox, view: MessagesAdmin },
]

export default function Admin() {
  useSeo({ title: 'Admin — HireNest', noindex: true })
  const [sp, setSp] = useSearchParams()
  const active = tabs.find((t) => t.id === sp.get('tab')) ?? tabs[0]
  const View = active.view
  return (
    <DashShell title="Admin panel" subtitle="Everything across candidates, employers, jobs, payments and messages." tabs={tabs} active={active.id} onChange={(t) => setSp({ tab: t })}>
      {isDemo && <p className="mb-5 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-700">Demo mode: showing sample data. Connect Supabase to see and edit real records.</p>}
      <View />
    </DashShell>
  )
}

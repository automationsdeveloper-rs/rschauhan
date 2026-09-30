import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import ComingSoon from './pages/ComingSoon'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Apply from './pages/Apply'
import RequestJob from './pages/RequestJob'
import Hire from './pages/Hire'
import Pricing from './pages/Pricing'
const CandidateDashboard = lazy(() => import('./pages/dashboard/CandidateDashboard'))
const EmployerDashboard = lazy(() => import('./pages/dashboard/EmployerDashboard'))
const Admin = lazy(() => import('./pages/admin/Admin'))
import { Login, Signup, ForgotPassword, ResetPassword, ProtectedRoute } from './pages/Auth'

// Routes marked with a phase are stubs until that phase is built.
const stubs = [
  ['about', 'About', 'Phase 5'], ['contact', 'Contact', 'Phase 5'],
  ['privacy', 'Privacy Policy', 'Phase 5'], ['terms', 'Terms & Conditions', 'Phase 5'], ['refund-policy', 'Refund Policy', 'Phase 5'],
  ]

const guarded = [
  ['dashboard/candidate', CandidateDashboard, ['candidate', 'admin']],
  ['dashboard/employer', EmployerDashboard, ['employer', 'admin']],
  ['admin', Admin, ['admin']],
]

export default function App() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center pt-24"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="jobs/:id/apply" element={<Apply />} />
        <Route path="request-job" element={<RequestJob />} />
        <Route path="hire" element={<Hire />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        {guarded.map(([path, Page, roles]) => <Route key={path} path={path} element={<ProtectedRoute roles={roles}><Page /></ProtectedRoute>} />)}
        {stubs.map(([path, title, phase]) => <Route key={path} path={path} element={<ComingSoon title={title} phase={phase} />} />)}
        <Route path="*" element={<ComingSoon notFound />} />
      </Route>
    </Routes>
    </Suspense>
  )
}

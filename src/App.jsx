import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'

// Everything except the home page is code-split so the first paint ships only what it needs.
const pick = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })))
const Jobs = lazy(() => import('./pages/Jobs'))
const JobDetail = lazy(() => import('./pages/JobDetail'))
const Apply = lazy(() => import('./pages/Apply'))
const RequestJob = lazy(() => import('./pages/RequestJob'))
const Hire = lazy(() => import('./pages/Hire'))
const Pricing = lazy(() => import('./pages/Pricing'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Privacy = pick(() => import('./pages/Legal'), 'Privacy')
const Terms = pick(() => import('./pages/Legal'), 'Terms')
const Refund = pick(() => import('./pages/Legal'), 'Refund')
const Login = pick(() => import('./pages/Auth'), 'Login')
const Signup = pick(() => import('./pages/Auth'), 'Signup')
const ForgotPassword = pick(() => import('./pages/Auth'), 'ForgotPassword')
const ResetPassword = pick(() => import('./pages/Auth'), 'ResetPassword')
const CandidateDashboard = lazy(() => import('./pages/dashboard/CandidateDashboard'))
const EmployerDashboard = lazy(() => import('./pages/dashboard/EmployerDashboard'))
const Admin = lazy(() => import('./pages/admin/Admin'))

const guarded = [
  ['dashboard/candidate', CandidateDashboard, ['candidate', 'admin']],
  ['dashboard/employer', EmployerDashboard, ['employer', 'admin']],
  ['admin', Admin, ['admin']],
]

const Fallback = () => (
  <div className="grid min-h-[60vh] place-items-center pt-24" aria-busy="true">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status" aria-label="Loading" />
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="jobs/:id/apply" element={<Apply />} />
          <Route path="request-job" element={<RequestJob />} />
          <Route path="hire" element={<Hire />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="refund-policy" element={<Refund />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          {guarded.map(([path, Page, roles]) => <Route key={path} path={path} element={<ProtectedRoute roles={roles}><Page /></ProtectedRoute>} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

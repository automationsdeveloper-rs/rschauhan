import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth, dashboardPath } from '../context/AuthContext'

/** Wrap dashboard routes: redirects to /login and enforces the role. */
export default function ProtectedRoute({ roles, children }) {
  const { user, role, loading, enabled } = useAuth()
  const loc = useLocation()
  if (!enabled) return children // demo mode: let the sample dashboards render
  if (loading || (user && !role)) return <div className="grid min-h-[60vh] place-items-center" aria-busy="true"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" /></div>
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (roles && !roles.includes(role)) return <Navigate to={dashboardPath(role)} replace />
  return children
}

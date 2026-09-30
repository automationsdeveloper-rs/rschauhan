import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Building2, Loader2, MailCheck, UserRound } from 'lucide-react'
import { Input } from '../components/forms/Fields'
import { LogoMark } from '../components/ui/Logo'
import { useAuth, dashboardPath } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSeo } from '../lib/hooks'

function Shell({ title, subtitle, children, footer }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 pb-12 pt-28">
      <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 animate-blob rounded-full bg-primary/25 blur-[100px]" />
      <div className="pointer-events-none absolute -right-10 bottom-10 h-80 w-80 animate-blob rounded-full bg-secondary/25 blur-[100px] [animation-delay:-8s]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative w-full max-w-md rounded-3xl p-7 md:p-9">
        <LogoMark className="mb-5 h-11 w-11" />
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
      </motion.div>
    </div>
  )
}

function NotConfigured() {
  return <p className="mb-5 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-600">Auth is disabled: add <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> and restart the dev server.</p>
}

function GoogleButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="btn btn-outline w-full">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" /><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.200 1.100-3.700 1.100-2.800 0-5.200-1.900-6-4.500H2.400v2.800A11 11 0 0012 23z" /><path fill="#FBBC05" d="M6 14.200a6.600 6.600 0 010-4.300V7.100H2.400a11 11 0 000 9.900z" /><path fill="#EA4335" d="M12 5.400c1.600 0 3 .6 4.100 1.600l3.100-3.100A11 11 0 002.400 7.100L6 9.900c.8-2.600 3.200-4.500 6-4.500z" /></svg>
      Continue with Google
    </button>
  )
}

const Divider = () => <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>

const emailField = z.string().trim().email('Enter a valid email address')
const passField = z.string().min(8, 'Use at least 8 characters')

export function Login() {
  useSeo({ title: 'Login — HireNest' })
  const auth = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const from = useLocation().state?.from
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(z.object({ email: emailField, password: z.string().min(1, 'Enter your password') })) })

  useEffect(() => { if (auth.user && auth.profile) nav(from || dashboardPath(auth.role), { replace: true }) }, [auth.user, auth.profile, auth.role, from, nav])

  const onSubmit = async (v) => {
    const { error } = await auth.signIn(v.email, v.password)
    if (error) toast(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message, 'error')
  }

  return (
    <Shell title="Welcome back" subtitle="Log in to track applications and requests." footer={<>New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></>}>
      {!auth.enabled && <NotConfigured />}
      <GoogleButton onClick={() => auth.enabled && auth.signInWithGoogle()} />
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link></div>
        <button disabled={isSubmitting || !auth.enabled} className="btn btn-primary btn-lg w-full">{isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log in'}</button>
      </form>
    </Shell>
  )
}

export function Signup() {
  useSeo({ title: 'Sign up — HireNest' })
  const auth = useAuth()
  const { toast } = useToast()
  const [role, setRole] = useState('candidate')
  const [sent, setSent] = useState(false)
  const schema = z.object({ name: z.string().trim().min(2, 'Enter your name'), email: emailField, password: passField })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (v) => {
    const { data, error } = await auth.signUp({ ...v, role })
    if (error) return toast(error.message, 'error')
    if (data.session) return // email confirmation disabled → auth listener redirects
    setSent(true)
  }

  if (sent) {
    return (
      <Shell title="Check your inbox" subtitle="We've sent a confirmation link to your email.">
        <div className="grid place-items-center py-4 text-primary"><MailCheck className="h-14 w-14" /></div>
        <p className="text-center text-sm text-muted">Click the link to activate your account, then <Link to="/login" className="font-semibold text-primary">log in</Link>.</p>
      </Shell>
    )
  }

  return (
    <Shell title="Create your account" subtitle="Free for job seekers. Takes under a minute." footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></>}>
      {!auth.enabled && <NotConfigured />}
      <div className="mb-5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="I am a">
        {[['candidate', 'Job seeker', UserRound], ['employer', 'Employer', Building2]].map(([id, label, Icon]) => (
          <button key={id} type="button" role="radio" aria-checked={role === id} onClick={() => setRole(id)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${role === id ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted hover:border-primary/50'}`}><Icon className="h-4 w-4" />{label}</button>
        ))}
      </div>
      {role === 'candidate' && <><GoogleButton onClick={() => auth.enabled && auth.signInWithGoogle()} /><Divider /></>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label={role === 'employer' ? 'Contact person name' : 'Full name'} autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} hint="At least 8 characters" {...register('password')} />
        <button disabled={isSubmitting || !auth.enabled} className="btn btn-primary btn-lg w-full">{isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}</button>
      </form>
    </Shell>
  )
}

export function ForgotPassword() {
  const auth = useAuth()
  const { toast } = useToast()
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(z.object({ email: emailField })) })
  const onSubmit = async ({ email }) => {
    const { error } = await auth.resetPassword(email)
    if (error) toast(error.message, 'error'); else setSent(true)
  }
  return (
    <Shell title="Forgot password?" subtitle="We'll email you a reset link." footer={<Link to="/login" className="font-semibold text-primary hover:underline">Back to login</Link>}>
      {!auth.enabled && <NotConfigured />}
      {sent ? <p className="rounded-xl bg-success/10 p-4 text-sm text-success">If an account exists for that email, a reset link is on its way.</p> : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <button disabled={isSubmitting || !auth.enabled} className="btn btn-primary btn-lg w-full">{isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send reset link'}</button>
        </form>
      )}
    </Shell>
  )
}

export function ResetPassword() {
  const auth = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const schema = z.object({ password: passField, confirm: z.string() }).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const onSubmit = async ({ password }) => {
    const { error } = await auth.updatePassword(password)
    if (error) return toast(error.message, 'error')
    toast('Password updated', 'success'); nav('/login')
  }
  return (
    <Shell title="Set a new password" subtitle="Choose something you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="New password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
        <button disabled={isSubmitting || !auth.enabled} className="btn btn-primary btn-lg w-full">{isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update password'}</button>
      </form>
    </Shell>
  )
}

/** Wrap dashboard routes: redirects to /login and enforces the role. */
export function ProtectedRoute({ roles, children }) {
  const { user, role, loading, enabled } = useAuth()
  const loc = useLocation()
  if (!enabled) return children // demo mode: let the placeholder dashboards render
  if (loading || (user && !role)) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (roles && !roles.includes(role)) return <Navigate to={dashboardPath(role)} replace />
  return children
}

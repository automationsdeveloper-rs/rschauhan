import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null) // row from public.users (has role)
  const [loading, setLoading] = useState(!!supabase)

  const loadProfile = useCallback(async (user) => {
    if (!user) return setProfile(null)
    // attach earlier guest applications/requests (same confirmed email) to this account
    try { await supabase.rpc('link_account') } catch { /* migration 003 not applied yet */ }
    const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
    // fall back to metadata while the trigger row is being created
    setProfile(data ?? { id: user.id, email: user.email, role: user.user_metadata?.role ?? 'candidate', name: user.user_metadata?.name })
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); loadProfile(data.session?.user).finally(() => setLoading(false)) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setTimeout(() => loadProfile(s?.user), 0) })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const value = {
    user: session?.user ?? null,
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    enabled: !!supabase,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: ({ email, password, name, role }) =>
      supabase.auth.signUp({ email, password, options: { data: { name, role }, emailRedirectTo: window.location.origin + '/login' } }),
    // Google users are created as candidates; employers should sign up with email.
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/login' } }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' }),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    signOut: () => supabase.auth.signOut(),
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export const dashboardPath = (role) => (role === 'admin' ? '/admin' : role === 'employer' ? '/dashboard/employer' : '/dashboard/candidate')

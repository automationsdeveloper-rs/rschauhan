import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { fetchJobs } from './jobsApi'
import { useAuth } from '../context/AuthContext'

/** Loads open jobs; `loading` drives skeletons. */
export function useJobs() {
  const [state, setState] = useState({ jobs: [], loading: true, error: null })
  useEffect(() => {
    let live = true
    fetchJobs().then((jobs) => live && setState({ jobs, loading: false, error: null }))
      .catch((error) => live && setState({ jobs: [], loading: false, error }))
    return () => { live = false }
  }, [])
  return state
}

const KEY = 'saved-jobs'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? [] } catch { return [] } }

/** Saved jobs: localStorage for guests, mirrored to `saved_jobs` when signed in. */
export function useSavedJobs() {
  const { user } = useAuth()
  const [ids, setIds] = useState(read)

  useEffect(() => {
    if (!user || !supabase) return
    supabase.from('saved_jobs').select('job_id').then(({ data }) => {
      if (data) setIds((cur) => [...new Set([...cur, ...data.map((d) => d.job_id)])])
    })
  }, [user])

  const toggle = useCallback((jobId) => {
    setIds((cur) => {
      const saved = cur.includes(jobId)
      const next = saved ? cur.filter((i) => i !== jobId) : [...cur, jobId]
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      if (user && supabase) {
        if (saved) supabase.from('saved_jobs').delete().eq('job_id', jobId).then(() => {})
        else supabase.from('saved_jobs').upsert({ user_id: user.id, job_id: jobId }).then(() => {})
      }
      return next
    })
  }, [user])

  return { ids, isSaved: (id) => ids.includes(id), toggle }
}

/** Sets <title>, meta description and optional JSON-LD for a page. */
export function useSeo({ title, description, jsonLd }) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content')
    if (description && meta) meta.setAttribute('content', description)
    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => {
      document.title = prev
      if (meta && prevDesc) meta.setAttribute('content', prevDesc)
      script?.remove()
    }
  }, [title, description, jsonLd])
}

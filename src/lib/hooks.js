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

/** Sets <title>, description, Open Graph + canonical tags and optional JSON-LD for a page; restores the previous values on unmount. */
export function useSeo({ title, description, jsonLd, noindex = false }) {
  useEffect(() => {
    const head = document.head
    const url = window.location.origin + window.location.pathname
    const setMeta = (attr, name, value) => {
      let el = head.querySelector(`meta[${attr}="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); head.appendChild(el) }
      const prev = el.getAttribute('content')
      el.setAttribute('content', value)
      return () => (prev == null ? el.remove() : el.setAttribute('content', prev))
    }

    const prevTitle = document.title
    document.title = title
    const undo = [
      setMeta('property', 'og:title', title), setMeta('name', 'twitter:title', title), setMeta('property', 'og:url', url),
      setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow'),
    ]
    if (description) undo.push(setMeta('name', 'description', description), setMeta('property', 'og:description', description), setMeta('name', 'twitter:description', description))

    let canonical = head.querySelector('link[rel="canonical"]')
    const hadCanonical = !!canonical
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; head.appendChild(canonical) }
    const prevHref = canonical.getAttribute('href')
    canonical.setAttribute('href', url)

    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      head.appendChild(script)
    }
    return () => {
      document.title = prevTitle
      undo.forEach((fn) => fn())
      if (hadCanonical) canonical.setAttribute('href', prevHref); else canonical.remove()
      script?.remove()
    }
  }, [title, description, jsonLd, noindex])
}

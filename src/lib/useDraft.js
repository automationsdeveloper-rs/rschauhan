import { useEffect } from 'react'

/** Form drafts survive refresh (localStorage). Files are uploaded on select, so only their paths are stored. */
export const loadDraft = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
export const clearDraft = (key) => { try { localStorage.removeItem(key); localStorage.removeItem(key + ':step') } catch { /* ignore */ } }
export const loadStep = (key) => { try { return Number(localStorage.getItem(key + ':step')) || 0 } catch { return 0 } }
export const saveStep = (key, n) => { try { localStorage.setItem(key + ':step', String(n)) } catch { /* ignore */ } }

export function useDraftSaver(key, watch, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const sub = watch((values) => {
      try { localStorage.setItem(key, JSON.stringify({ ...values, consent: false })) } catch { /* ignore */ }
    })
    return () => sub.unsubscribe()
  }, [key, watch, enabled])
}

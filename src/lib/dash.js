import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemo } from './supabase'
import { useToast } from '../context/ToastContext'

export const APP_STATUSES = [['applied', 'Applied'], ['under_review', 'Under Review'], ['shortlisted', 'Shortlisted'], ['interview', 'Interview'], ['selected', 'Selected'], ['rejected', 'Rejected']]
export const CJR_STATUSES = [['submitted', 'Submitted'], ['in_progress', 'In Progress'], ['matches_shared', 'Matches Shared'], ['closed', 'Closed']]
export const EMP_STATUSES = [['submitted', 'Submitted'], ['in_progress', 'In Progress'], ['profiles_shared', 'Profiles Shared'], ['closed', 'Closed']]
export const PAY_STATUSES = ['pending', 'paid', 'failed', 'refunded']
export const label = (list, v) => list.find(([k]) => k === v)?.[1] ?? v

/** Loads data once and on reload(). In demo mode it resolves the provided sample data instead. */
export function useAsync(fetcher, deps, demo) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true }))
    Promise.resolve(isDemo ? demo : fetcher())
      .then((data) => live && setState({ data, loading: false, error: null }))
      .catch((error) => live && setState({ data: null, loading: false, error }))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })), [])
  return { ...state, reload, setData }
}

/** Wraps a write: blocks in demo mode, shows success/error toasts. Returns true on success. */
export function useAction() {
  const { toast } = useToast()
  return useCallback(async (fn, okMsg) => {
    if (isDemo) { toast('Demo mode: connect Supabase to save changes.', 'info'); return false }
    try {
      const res = await fn()
      if (res?.error) throw res.error
      if (okMsg) toast(okMsg, 'success')
      return true
    } catch (e) {
      toast(e?.message || 'Something went wrong. Please try again.', 'error')
      return false
    }
  }, [toast])
}

/** Opens a private CV via a short-lived signed URL. */
export async function openCv(path, toast) {
  if (isDemo) return toast('Demo mode: no real CV to open.', 'info')
  if (!path) return toast('No CV on file.', 'info')
  const { data, error } = await supabase.storage.from('cvs').createSignedUrl(path, 120)
  if (error) return toast('Could not open this CV.', 'error')
  window.open(data.signedUrl, '_blank', 'noopener')
}

/** Tells the API to send the email + in-app notification for a status change (admin only, best-effort). */
export async function notifyStatus(kind, id) {
  if (isDemo) return
  const { data } = await supabase.auth.getSession()
  fetch('/api/notify-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` },
    body: JSON.stringify({ kind, id }),
  }).catch(() => {})
}

/** CSV with BOM (opens cleanly in Excel). Cells starting with = + - @ are neutralised against formula injection. */
export function downloadCsv(filename, columns, rows) {
  const cell = (v) => {
    let s = Array.isArray(v) ? v.join('; ') : v == null ? '' : String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
    return `"${s.replace(/"/g, '""')}"`
  }
  const csv = [columns.map((c) => cell(c.header)).join(','), ...rows.map((r) => columns.map((c) => cell(c.value(r))).join(','))].join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

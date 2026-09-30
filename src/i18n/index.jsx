import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './en'
import hi from './hi'

const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x)
/** Deep-merges a translation over English so any untranslated key falls back gracefully. */
export const merge = (base, over) => {
  const out = { ...base }
  for (const k of Object.keys(over)) out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k]
  return out
}

export const dicts = { en, hi: merge(en, hi) }
export const LANGS = ['en', 'hi']

const LangContext = createContext({ lang: 'en', d: en, setLang: () => {}, toggle: () => {}, t: (k) => k })

const initial = () => {
  try { const s = localStorage.getItem('lang'); if (LANGS.includes(s)) return s } catch { /* private mode */ }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en'
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initial)
  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem('lang', lang) } catch { /* ignore */ }
  }, [lang])

  const value = useMemo(() => ({
    lang, d: dicts[lang], setLang,
    toggle: () => setLang((l) => (l === 'en' ? 'hi' : 'en')),
    /** t('jobs.many', { n: 4 }) → "4 jobs match your search" */
    t: (path, vars) => {
      let s = path.split('.').reduce((o, k) => o?.[k], dicts[lang])
      if (typeof s !== 'string') return path
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
      return s
    },
  }), [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

/** "today" / "1 day ago" / "3 days ago" in the active language. */
export const postedIn = (d, days) => (days === 0 ? d.jobs.today : days === 1 ? d.jobs.dayAgo : d.jobs.daysAgo.replace('{n}', days))

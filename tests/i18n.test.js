import { describe, it, expect } from 'vitest'
import en from '../src/i18n/en.js'
import hi from '../src/i18n/hi.js'
import { dicts, merge } from '../src/i18n/index.jsx'

/** Flattens {a:{b:'x'}} → { 'a.b': 'x' } (arrays are compared by length + element shape). */
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]))

describe('i18n dictionaries', () => {
  const enKeys = flat(en), hiMap = Object.fromEntries(flat(hi))
  it('Hindi covers every English key', () => {
    const missing = enKeys.filter(([k]) => !(k in hiMap)).map(([k]) => k)
    expect(missing).toEqual([])
  })
  it('arrays have the same length in both languages', () => {
    for (const [k, v] of enKeys) if (Array.isArray(v)) expect(hiMap[k], k).toHaveLength(v.length)
  })
  it('no Hindi string is empty or identical to English (except intentionally shared labels)', () => {
    const shared = new Set(['faq.eyebrow', 'nav.switchLang', 'nav.langShort'])
    for (const [k, v] of enKeys) {
      if (typeof v !== 'string' || shared.has(k)) continue
      expect(hiMap[k].trim(), k).not.toBe('')
      expect(hiMap[k], k).not.toBe(v)
    }
  })
  it('falls back to English for missing keys', () => {
    expect(merge({ a: { b: 'B', c: 'C' } }, { a: { b: 'ब' } })).toEqual({ a: { b: 'ब', c: 'C' } })
    expect(dicts.hi.nav.jobs).not.toBe(dicts.en.nav.jobs)
  })
})

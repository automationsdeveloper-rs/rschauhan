import { forwardRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export function FieldError({ error, id }) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.p id={id} role="alert" initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

const base = 'peer input !pb-2 !pt-6 placeholder-transparent'
const labelCls = 'pointer-events-none absolute left-4 top-2 origin-left text-[11px] font-medium text-muted transition-all duration-150 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-primary'

/** Text input with floating label + animated inline error. */
export const Input = forwardRef(function Input({ label, error, prefix, hint, className = '', ...rest }, ref) {
  const id = rest.id || rest.name
  return (
    <div className={className}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-[1.55rem] text-sm text-muted">{prefix}</span>}
        <input ref={ref} id={id} placeholder=" " aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          className={`${base} ${prefix ? '!pl-12' : ''} ${error ? '!border-danger focus:!ring-danger/15' : ''}`} {...rest} />
        <label htmlFor={id} className={`${labelCls} ${prefix ? 'peer-placeholder-shown:left-12 left-12' : ''}`}>{label}</label>
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <FieldError error={error} id={`${id}-err`} />
    </div>
  )
})

export const Select = forwardRef(function Select({ label, error, options, className = '', ...rest }, ref) {
  const id = rest.id || rest.name
  return (
    <div className={className}>
      <div className="relative">
        <select ref={ref} id={id} aria-invalid={!!error} className={`input !pb-2 !pt-6 ${error ? '!border-danger' : ''}`} {...rest}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <label htmlFor={id} className="pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-muted">{label}</label>
      </div>
      <FieldError error={error} id={`${id}-err`} />
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, className = '', ...rest }, ref) {
  const id = rest.id || rest.name
  return (
    <div className={className}>
      <div className="relative">
        <textarea ref={ref} id={id} placeholder=" " rows={4} className={`${base} resize-y ${error ? '!border-danger' : ''}`} {...rest} />
        <label htmlFor={id} className={labelCls}>{label}</label>
      </div>
      <FieldError error={error} id={`${id}-err`} />
    </div>
  )
})

/** Type a skill and press Enter / comma to add a chip. */
export function TagInput({ label, value = [], onChange, error, suggestions = [] }) {
  const [text, setText] = useState('')
  const add = (raw) => {
    const t = raw.trim().replace(/,$/, '')
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase()) && value.length < 20) onChange([...value, t])
    setText('')
  }
  return (
    <div>
      <div className={`input flex min-h-[3.5rem] flex-wrap items-center gap-2 !py-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 ${error ? '!border-danger' : ''}`}>
        <AnimatePresence>
          {value.map((t) => (
            <motion.span key={t} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              className="flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-primary">
              {t}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} aria-label={`Remove ${t}`} className="rounded-full p-0.5 hover:bg-primary/20"><X className="h-3 w-3" /></button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input value={text} aria-label={label} placeholder={value.length ? '' : `${label} — type and press Enter`}
          onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(text) } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1)) }}
          onBlur={() => text && add(text)}
          className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70" />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.filter((s) => !value.includes(s)).slice(0, 6).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-primary hover:text-primary">+ {s}</button>
          ))}
        </div>
      )}
      <FieldError error={error} />
    </div>
  )
}

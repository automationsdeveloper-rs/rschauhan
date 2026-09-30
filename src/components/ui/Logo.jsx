import { Link } from 'react-router-dom'
import { site } from '../../config/site'

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <span className={`grid place-items-center rounded-xl bg-brand-gradient text-white shadow-glow ${className}`} aria-hidden>
      <svg viewBox="0 0 32 32" className="h-1/2 w-1/2" fill="currentColor"><path d="M9 23V9h3v5.5h8V9h3v14h-3v-5.8h-8V23z" /></svg>
    </span>
  )
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <LogoMark />
      <span className={`font-heading text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-fg'}`}>{site.name}</span>
    </Link>
  )
}

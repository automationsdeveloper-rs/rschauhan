import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Send, Check } from 'lucide-react'
import Logo from '../ui/Logo'
import { site } from '../../config/site'
import { subscribeNewsletter } from '../../lib/jobsApi'
import { useToast } from '../../context/ToastContext'

const Social = ({ href, label, children }) => (
  <a href={href} aria-label={label} className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white/80 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>{children}</svg>
  </a>
)

const cols = [
  { title: 'Quick Links', links: [['Home', '/'], ['Find Jobs', '/jobs'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']] },
  { title: 'For Candidates', links: [['Browse Jobs', '/jobs'], ['Request a Job', '/request-job'], ['Candidate Dashboard', '/dashboard/candidate'], ['Login / Sign up', '/login']] },
  { title: 'For Employers', links: [['Raise Hiring Request', '/hire'], ['Employer Pricing', '/pricing'], ['Employer Dashboard', '/dashboard/employer'], ['Partner With Us', '/contact']] },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const { toast } = useToast()

  const subscribe = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Please enter a valid email address.', 'error')
    try {
      await subscribeNewsletter(email)
      setDone(true); setEmail(''); toast("You're subscribed. Welcome aboard!", 'success')
    } catch { toast('Could not subscribe right now. Please try again.', 'error') }
  }

  return (
    <footer className="relative overflow-hidden bg-[#0B0F1E] pt-20 text-white/70">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]" />
      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{site.tagline} Two-sided recruitment made simple, fast and transparent.</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />{site.email}</li>
              <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />{site.phone}</li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />{site.address}</li>
            </ul>
            <div className="mt-6 flex gap-2">
              <Social href={site.social.linkedin} label="LinkedIn"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9.75h4v11.5H3zM9.5 9.75h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.85h-4v-5.2c0-1.24-.02-2.83-1.73-2.83s-2 1.35-2 2.74v5.29h-4z" /></Social>
              <Social href={site.social.instagram} label="Instagram"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm5 3.5A4.5 4.5 0 1112 16.5 4.5 4.5 0 0112 7.5zm0 2A2.5 2.5 0 1014.5 12 2.5 2.5 0 0012 9.5zM17.3 5.7a1 1 0 11-1 1 1 1 0 011-1z" /></Social>
              <Social href={site.social.x} label="X (Twitter)"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.16h1.7L7.4 4.75H5.57z" /></Social>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{c.title}</h3>
              <ul className="space-y-2.5 text-sm">
                {c.links.map(([l, to]) => <li key={l}><Link to={to} className="transition hover:text-white">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Get job alerts & hiring tips</h3>
            <p className="mt-1 text-sm">One helpful email a week. Unsubscribe anytime.</p>
          </div>
          <form onSubmit={subscribe} className="mt-4 flex w-full max-w-md gap-2 md:mt-0" noValidate>
            <label htmlFor="newsletter" className="sr-only">Email address</label>
            <input id="newsletter" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setDone(false) }} placeholder="you@email.com"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/20" />
            <button className="btn btn-primary shrink-0" aria-label="Subscribe">{done ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}<span className="hidden sm:inline">{done ? 'Subscribed' : 'Subscribe'}</span></button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs md:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

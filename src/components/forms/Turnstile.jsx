import { useEffect, useRef } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

/** Cloudflare Turnstile widget. Renders nothing when VITE_TURNSTILE_SITE_KEY is not set. */
export default function Turnstile({ onToken }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!SITE_KEY) return
    let id
    const render = () => { id = window.turnstile.render(ref.current, { sitekey: SITE_KEY, callback: onToken, 'expired-callback': () => onToken(null) }) }
    if (window.turnstile) render()
    else {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.onload = render
      document.head.appendChild(s)
    }
    return () => { try { window.turnstile?.remove(id) } catch { /* ignore */ } }
  }, [onToken])
  return SITE_KEY ? <div ref={ref} className="my-2" /> : null
}
export const captchaEnabled = !!SITE_KEY

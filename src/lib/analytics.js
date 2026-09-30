// Google Analytics 4, loaded only when VITE_GA_ID is set AND the visitor accepted cookies.
// Vercel Analytics (cookieless) is mounted separately in main.jsx and needs no consent gate.
const GA_ID = import.meta.env.VITE_GA_ID
let loaded = false

export const cookieConsent = () => { try { return localStorage.getItem('cookie-consent') } catch { return null } }

export function loadAnalytics() {
  if (!GA_ID || loaded || cookieConsent() !== 'accepted') return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(s)
}

export function trackPageView(path) {
  if (!loaded) return
  window.gtag('event', 'page_view', { page_path: path, page_title: document.title, page_location: window.location.href })
}

/** Custom events, e.g. trackEvent('apply_submitted', { job_id }) */
export function trackEvent(name, params = {}) {
  if (loaded) window.gtag('event', name, params)
}

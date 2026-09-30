import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import { WhatsAppButton, CookieBanner } from './FloatingWidgets'
import { loadAnalytics, trackPageView } from '../../lib/analytics'
import { useLang } from '../../i18n'

/** Scroll handling + analytics on route change. */
function RouteEffects() {
  const { pathname, hash } = useLocation()

  useEffect(() => { // analytics loads only after cookie consent (or immediately if it was given earlier)
    loadAnalytics()
    const onConsent = (e) => e.detail === 'accepted' && loadAnalytics()
    window.addEventListener('cookie-consent', onConsent)
    return () => window.removeEventListener('cookie-consent', onConsent)
  }, [])

  useEffect(() => { trackPageView(pathname) }, [pathname])

  useEffect(() => { // scroll to top on navigation, or to the #anchor if present
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function Layout() {
  const { pathname } = useLocation()
  const { d } = useLang()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white">{d.nav.skip}</a>
      <RouteEffects />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main id="main" key={pathname} tabIndex={-1} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </>
  )
}

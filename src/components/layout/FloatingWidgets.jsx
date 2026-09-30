import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '../../config/site'

export function WhatsAppButton() {
  return (
    <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi ${site.name}, I need some help.`)}`} target="_blank" rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgb(37_211_102/.7)] transition hover:scale-110">
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" aria-hidden />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  )
}

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try { if (!localStorage.getItem('cookie-consent')) setShow(true) } catch { setShow(true) }
  }, [])

  const choose = (v) => {
    try { localStorage.setItem('cookie-consent', v) } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('cookie-consent', { detail: v })) // analytics listens for "accepted"
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ delay: 1.2, duration: 0.4 }}
          role="dialog" aria-label="Cookie consent"
          className="glass fixed bottom-5 left-5 z-40 max-w-sm rounded-2xl p-5 !bg-surface/90 max-sm:right-24">
          <p className="text-sm text-muted">We use cookies to improve your experience and analyse traffic. See our <Link to="/privacy" className="font-semibold text-primary underline">Privacy Policy</Link>.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => choose('accepted')} className="btn btn-primary !px-4 !py-2">Accept</button>
            <button onClick={() => choose('declined')} className="btn btn-outline !px-4 !py-2">Decline</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

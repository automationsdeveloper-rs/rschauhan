import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { nav } from '../../config/site'
import { useTheme } from '../../context/ThemeContext'
import { useAuth, dashboardPath } from '../../context/AuthContext'
import { useLang } from '../../i18n'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const { user, role, signOut } = useAuth()
  const { d, lang, toggle: toggleLang } = useLang()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const iconBtn = 'grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface/70 text-fg transition hover:border-primary hover:text-primary'
  const authButtons = (mobile) => user ? (
    <>
      <button onClick={() => { signOut(); setOpen(false) }} className={`btn ${mobile ? 'btn-outline' : 'btn-ghost hidden lg:inline-flex'}`}>{d.nav.logout}</button>
      <Button to={dashboardPath(role)} onClick={() => setOpen(false)} className={mobile ? '' : 'hidden sm:inline-flex !py-2.5'}>{d.nav.dashboard}</Button>
    </>
  ) : (
    <>
      <Button to="/login" variant={mobile ? 'outline' : 'ghost'} onClick={() => setOpen(false)} className={mobile ? '' : 'hidden lg:inline-flex'}>{d.nav.login}</Button>
      <Button to="/signup" onClick={() => setOpen(false)} className={mobile ? '' : 'hidden sm:inline-flex !py-2.5'}>{d.nav.start}</Button>
    </>
  )

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-line bg-bg/70 py-2 backdrop-blur-xl shadow-soft' : 'py-4'}`}>
      <div className="container flex items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.key} to={n.to}
              className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${isActive && !n.to.includes('#') ? 'text-primary' : 'text-fg/80'}`}>
              {d.nav[n.key]}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleLang} aria-label={d.nav.switchLang} title={d.nav.switchLang} lang={lang === 'en' ? 'hi' : 'en'} className={`${iconBtn} text-xs font-bold`}>{d.nav.langShort}</button>
          <button onClick={toggle} aria-label={theme === 'dark' ? d.nav.toLight : d.nav.toDark} className={iconBtn}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {authButtons(false)}
          <button onClick={() => setOpen(true)} aria-label={d.nav.openMenu} aria-expanded={open} className={`${iconBtn} lg:hidden`}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-2xl lg:hidden" role="dialog" aria-modal="true" aria-label="Menu"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }}>
            <div className="container flex items-center justify-between py-4">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label={d.nav.closeMenu} className="grid h-10 w-10 place-items-center rounded-xl border border-line"><X className="h-5 w-5" /></button>
            </div>
            <nav className="container mt-6 flex flex-col gap-1" aria-label="Mobile">
              {nav.map((n, i) => (
                <motion.div key={n.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={n.to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3.5 font-heading text-xl font-bold hover:bg-primary/10">{d.nav[n.key]}</Link>
                </motion.div>
              ))}
              <div className="mt-6 grid grid-cols-2 gap-3">{authButtons(true)}</div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
